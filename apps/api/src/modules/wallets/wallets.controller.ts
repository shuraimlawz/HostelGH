import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CreateSettlementAccountDto } from "./dto/create-settlement-account.dto";

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

  @Roles(UserRole.OWNER)
  @Get("banks")
  @ApiOperation({ summary: "Get list of supported banks/providers from Paystack" })
  getBanks() {
    return this.wallets.getBanks();
  }

  @Roles(UserRole.OWNER)
  @Get("settlement/me")
  @ApiOperation({ summary: "Get owner's settlement account details" })
  getSettlement(@Req() req: any) {
    return this.wallets.getSettlementAccount(req.user.userId);
  }

  @Roles(UserRole.OWNER)
  @Post("settlement")
  @ApiOperation({ summary: "Connect or update bank/Momo account for direct payouts" })
  updateSettlement(@Req() req: any, @Body() dto: CreateSettlementAccountDto) {
    return this.wallets.updateSettlementAccount(req.user.userId, dto);
  }
}
