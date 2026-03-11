import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { PaystackService } from "../payments/paystack.service";
import { randomBytes } from "crypto";
import { SubscriptionStatus } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";

export type PlanCode = "FREE" | "PRO" | "PREMIUM";

const DEFAULT_PLANS: Array<{
  code: PlanCode;
  name: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  listingLimit?: number | null;
  featuredIncluded?: boolean;
}> = [
  {
    code: "FREE",
    name: "Free",
    description: "Free plan with a single listing",
    monthlyPrice: 0,
    yearlyPrice: 0,
    listingLimit: 1,
    featuredIncluded: false,
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Up to 10 listings",
    monthlyPrice: 9900,
    yearlyPrice: 9900 * 12,
    listingLimit: 10,
    featuredIncluded: false,
  },
  {
    code: "PREMIUM",
    name: "Premium",
    description: "Unlimited listings + featured listings",
    monthlyPrice: 19900,
    yearlyPrice: 19900 * 12,
    listingLimit: null,
    featuredIncluded: true,
  },
];

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService,
  ) { }

  async onModuleInit() {
    await this.ensureDefaultPlans();
  }

  private async ensureDefaultPlans() {
    for (const plan of DEFAULT_PLANS) {
      await this.prisma.plan.upsert({
        where: { code: plan.code },
        update: {
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice ?? null,
          yearlyPrice: plan.yearlyPrice ?? null,
          listingLimit: plan.listingLimit ?? null,
          featuredIncluded: plan.featuredIncluded ?? false,
        },
        create: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice ?? null,
          yearlyPrice: plan.yearlyPrice ?? null,
          listingLimit: plan.listingLimit ?? null,
          featuredIncluded: plan.featuredIncluded ?? false,
        },
      });
    }
  }

  private async getPlanByCode(code: PlanCode) {
    await this.ensureDefaultPlans();
    const plan = await this.prisma.plan.findUnique({ where: { code } });
    if (!plan) throw new NotFoundException(`Plan not found: ${code}`);
    return plan;
  }

  private isSubscriptionActive(sub: { status: SubscriptionStatus; endDate: Date | null }) {
    if (sub.status !== SubscriptionStatus.ACTIVE) return false;
    if (!sub.endDate) return true;
    return new Date(sub.endDate) > new Date();
  }

  private async getEffectivePlan(ownerId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId: ownerId, status: SubscriptionStatus.ACTIVE },
      orderBy: { endDate: "desc" },
      include: { plan: true },
    });

    if (sub && this.isSubscriptionActive(sub)) {
      return { plan: sub.plan, subscription: sub };
    }

    if (sub && !this.isSubscriptionActive(sub)) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });
    }

    const freePlan = await this.getPlanByCode("FREE");
    return { plan: freePlan, subscription: null };
  }

  async getOwnerSubscription(ownerId: string) {
    const { plan, subscription } = await this.getEffectivePlan(ownerId);

    if (!subscription) {
      return {
        plan: plan.code,
        active: true,
        expiresAt: null,
        status: SubscriptionStatus.ACTIVE,
        planDetails: plan,
      };
    }

    return {
      plan: plan.code,
      active: this.isSubscriptionActive(subscription),
      expiresAt: subscription.endDate,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paymentReference: subscription.paymentReference,
      planDetails: plan,
    };
  }

  async checkLimit(
    ownerId: string,
    feature: "max_hostels" | "featured_listings" | "max_rooms",
    hostelId?: string,
  ) {
    const { plan } = await this.getEffectivePlan(ownerId);
    const isPremium = plan.code === "PREMIUM";
    const isPro = plan.code === "PRO";

    if (feature === "max_hostels") {
      const count = await this.prisma.hostel.count({ where: { ownerId } });
      const limit = plan.listingLimit;
      if (limit !== null && limit !== undefined && count >= limit) {
        throw new ForbiddenException(
          `Your ${plan.code} plan limit for hostels (${limit}) has been reached. Please upgrade.`,
        );
      }
    }

    if (feature === "max_rooms") {
      if (!hostelId) throw new NotFoundException("Hostel context required for room limits");
      const count = await this.prisma.room.count({ where: { hostelId } });
      const limit = isPremium || isPro ? 100 : 3;
      if (count >= limit) {
        throw new ForbiddenException(
          `Your ${plan.code} plan limit for rooms per property (${limit}) has been reached. Please upgrade.`,
        );
      }
    }

    if (feature === "featured_listings") {
      if (!plan.featuredIncluded) {
        throw new ForbiddenException(
          "Featured listings are only available on the PREMIUM plan or via paid featuring.",
        );
      }
    }

    return true;
  }

  async initiatePlanCheckout(
    ownerId: string,
    planCode: PlanCode,
    billingCycle: "monthly" | "yearly" = "monthly",
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw new NotFoundException("User not found");

    const plan = await this.getPlanByCode(planCode);
    if (plan.code === "FREE") {
      throw new ForbiddenException("Free plan does not require checkout.");
    }

    const amount =
      billingCycle === "yearly"
        ? plan.yearlyPrice ?? (plan.monthlyPrice ?? 0) * 12
        : plan.monthlyPrice ?? 0;

    if (!amount || amount <= 0) {
      throw new ForbiddenException("Selected plan is not billable.");
    }

    const reference = `SUB_${plan.code}_${randomBytes(8).toString("hex")}`;
    const appUrl =
      this.config.get<string>("FRONTEND_URL") ||
      this.config.get<string>("APP_URL");

    const initResponse = await this.paystack.initializeTransaction({
      email: user.email,
      amount,
      reference,
      callback_url: appUrl ? `${appUrl}/owner/subscription` : undefined,
      metadata: {
        ownerId,
        plan: plan.code,
        type: "subscription",
        billingCycle,
      },
    });

    return initResponse.data;
  }

  async initiateProUpgrade(
    ownerId: string,
    billingCycle: "monthly" | "yearly" = "monthly",
    planCode?: PlanCode,
  ) {
    const target = planCode || "PRO";
    return this.initiatePlanCheckout(ownerId, target, billingCycle);
  }

  async handleSubscriptionWebhook(reference: string, rawData: any) {
    const metadata = rawData?.metadata;
    if (!metadata || !["subscription", "subscription_upgrade"].includes(metadata.type)) return;

    const ownerId = metadata.ownerId;
    const planCode = metadata.plan as PlanCode;
    const billingCycle = metadata.billingCycle || "monthly";

    const expiresAt = new Date();
    if (billingCycle === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const plan = await this.getPlanByCode(planCode);
    const existingSub = await this.prisma.subscription.findFirst({
      where: { userId: ownerId },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          endDate: expiresAt,
          planId: plan.id,
          paymentReference: reference,
          startDate: new Date(),
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId: ownerId,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: expiresAt,
          planId: plan.id,
          paymentReference: reference,
        },
      });
    }
  }

  async downgradeToFree(ownerId: string) {
    const result = await this.prisma.subscription.updateMany({
      where: { userId: ownerId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELED, endDate: new Date() },
    });
    const freePlan = await this.getPlanByCode("FREE");
    await this.enforceListingLimit(ownerId, freePlan.listingLimit ?? 1);
    return result;
  }

  async enforceListingLimit(ownerId: string, limit: number | null) {
    if (limit === null) return;
    const hostels = await this.prisma.hostel.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (hostels.length <= limit) return;

    const toDisable = hostels.slice(limit).map((h) => h.id);
    await this.prisma.hostel.updateMany({
      where: { id: { in: toDisable } },
      data: { isPublished: false, isFeatured: false, featuredUntil: null },
    });
  }

  async expireSubscriptionsAndEnforceLimits() {
    const now = new Date();
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lt: now },
      },
      include: { plan: true },
    });

    if (expired.length === 0) return;

    const freePlan = await this.getPlanByCode("FREE");

    await this.prisma.subscription.updateMany({
      where: {
        id: { in: expired.map((s) => s.id) },
      },
      data: { status: SubscriptionStatus.EXPIRED },
    });

    for (const sub of expired) {
      try {
        await this.enforceListingLimit(sub.userId, freePlan.listingLimit ?? 1);
      } catch (err) {
        this.logger.warn(`Failed to enforce listing limit for user ${sub.userId}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleSubscriptionExpirations() {
    await this.expireSubscriptionsAndEnforceLimits();
  }
}
