import { Controller, Get, Post, Req, Body, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
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

  @Post("upgrade-pro")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async upgradeToPro(
    @Req() req: any,
    @Body("billingCycle") billingCycle: "monthly" | "yearly",
    @Body("planCode") planCode?: "FREE" | "PRO" | "PREMIUM",
  ) {
    return this.subscriptions.initiateProUpgrade(
      req.user.userId,
      billingCycle,
      planCode,
    );
  }

  @Post("downgrade-free")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async downgradeToFree(@Req() req: any) {
    return this.subscriptions.downgradeToFree(req.user.userId);
  }
}
