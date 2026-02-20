import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { PaystackService } from "../payments/paystack.service";
import { randomBytes } from "crypto";

export enum SubscriptionPlan {
  FREE = "FREE",
  PRO = "PRO",
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService,
  ) { }

  async getOwnerSubscription(ownerId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub) {
      return {
        plan: SubscriptionPlan.FREE,
        active: true,
        expiresAt: null,
      };
    }

    // Lazy Deactivation: Check if subscription has expired
    if (sub.active && sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { active: false },
      });
      return { ...sub, active: false };
    }

    return sub;
  }

  async checkLimit(
    ownerId: string,
    feature: "max_hostels" | "featured_listings" | "max_rooms",
    hostelId?: string,
  ) {
    const sub = await this.getOwnerSubscription(ownerId);
    const isPro = sub.plan === SubscriptionPlan.PRO;

    if (feature === "max_hostels") {
      const count = await this.prisma.hostel.count({ where: { ownerId } });
      const limit = isPro ? 50 : 3; // 3 for Free, 50 for Pro
      if (count >= limit) {
        throw new ForbiddenException(
          `Your ${sub.plan} plan limit for hostels (${limit}) has been reached. Please upgrade to Pro.`,
        );
      }
    }

    if (feature === "max_rooms") {
      if (!hostelId) throw new NotFoundException("Hostel context required for room limits");
      const count = await this.prisma.room.count({ where: { hostelId } });
      const limit = isPro ? 100 : 3; // 3 per hostel for Free
      if (count >= limit) {
        throw new ForbiddenException(
          `Your ${sub.plan} plan limit for rooms per property (${limit}) has been reached. Please upgrade to Pro.`,
        );
      }
    }

    if (feature === "featured_listings") {
      if (!isPro) {
        throw new ForbiddenException(
          "Featured listings are only available on the PRO plan. Please upgrade.",
        );
      }
    }

    return true;
  }

  async initiateProUpgrade(
    ownerId: string,
    billingCycle: "monthly" | "yearly" = "monthly",
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw new NotFoundException("User not found");

    const PRO_PLAN_PRICE = 9900; // GH₵ 99.00 in pesewas
    const reference = `SUB_PRO_${randomBytes(8).toString("hex")}`;
    const appUrl =
      this.config.get<string>("FRONTEND_URL") ||
      this.config.get<string>("APP_URL");

    const initResponse = await this.paystack.initializeTransaction({
      email: user.email,
      amount: PRO_PLAN_PRICE,
      reference,
      callback_url: appUrl ? `${appUrl}/owner/subscription` : undefined,
      metadata: {
        ownerId,
        plan: SubscriptionPlan.PRO,
        type: "subscription_upgrade",
        billingCycle,
      },
    });

    return initResponse.data;
  }

  async handleSubscriptionWebhook(reference: string, rawData: any) {
    const metadata = rawData?.metadata;
    if (!metadata || metadata.type !== "subscription_upgrade") return;

    const ownerId = metadata.ownerId;
    const plan = metadata.plan;
    const billingCycle = metadata.billingCycle || "monthly";

    const expiresAt = new Date();
    if (billingCycle === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Update or Create the subscription record
    // We use a specific ID pattern or find by ownerId to ensure one active sub
    const existingSub = await this.prisma.subscription.findFirst({
      where: { ownerId },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          active: true,
          expiresAt,
          plan: plan,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          ownerId,
          active: true,
          expiresAt,
          plan: plan,
        },
      });
    }
  }

  async downgradeToFree(ownerId: string) {
    // Immediate downgrade for MVP stability
    return this.prisma.subscription.updateMany({
      where: { ownerId, plan: SubscriptionPlan.PRO },
      data: { active: false },
    });
  }
}
