import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptions: SubscriptionsService) { }

    @Get("my")
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async getMySubscription(@Req() req: any) {
        return this.subscriptions.getOwnerSubscription(req.user.userId);
    }

    @Post("upgrade")
    @Roles(UserRole.OWNER)
    async upgradeToPro(@Req() req: any) {
        // This is a simplified "instant upgrade" for MVP/SaaS flow.
        return this.subscriptions.subscribeToPro(req.user.userId);
    }
}
