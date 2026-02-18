import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export enum SubscriptionPlan {
    FREE = "FREE",
    PRO = "PRO",
}

@Injectable()
export class SubscriptionsService {
    constructor(private readonly prisma: PrismaService) { }

    async getOwnerSubscription(ownerId: string) {
        const sub = await this.prisma.subscription.findFirst({
            where: { ownerId, active: true },
            orderBy: { expiresAt: "desc" },
        });

        if (!sub) {
            return {
                plan: SubscriptionPlan.FREE,
                active: true,
                expiresAt: null,
            };
        }

        return sub;
    }

    async checkLimit(ownerId: string, feature: "max_hostels" | "featured_listings") {
        const sub = await this.getOwnerSubscription(ownerId);
        const isPro = sub.plan === SubscriptionPlan.PRO;

        if (feature === "max_hostels") {
            const count = await this.prisma.hostel.count({ where: { ownerId } });
            const limit = isPro ? 50 : 1; // 1 for Free, 50 for Pro
            if (count >= limit) {
                throw new ForbiddenException(`Your ${sub.plan} plan limit for hostels (${limit}) has been reached. Please upgrade to Pro.`);
            }
        }

        if (feature === "featured_listings") {
            if (!isPro) {
                throw new ForbiddenException("Featured listings are only available on the PRO plan. Please upgrade.");
            }
        }

        return true;
    }

    async subscribeToPro(ownerId: string) {
        // In a real scenario, this would be called after a successful Paystack payment
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        return this.prisma.subscription.upsert({
            where: { id: `PRO_${ownerId}` }, // Simple unique ID for mock/simplicity
            update: {
                active: true,
                expiresAt,
                plan: SubscriptionPlan.PRO,
            },
            create: {
                id: `PRO_${ownerId}`,
                ownerId,
                active: true,
                expiresAt,
                plan: SubscriptionPlan.PRO,
            },
        });
    }
}
