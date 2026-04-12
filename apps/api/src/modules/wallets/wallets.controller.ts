import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Wallets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("wallets")
export class WalletsController {
  constructor(private wallets: WalletsService) {}

  @Roles(UserRole.OWNER, UserRole.TENANT)
  @Get("me")
  @ApiOperation({ summary: "Get current owner wallet balance" })
  getMe(@Req() req: any) {
    return this.wallets.getWalletByOwner(req.user.userId);
  }
}
