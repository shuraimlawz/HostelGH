import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PayoutsService } from "./payouts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UserRole } from "@prisma/client";
import { CreatePayoutMethodDto } from "./dto/provide-payout-method.dto";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Payouts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payouts")
export class PayoutsController {
  constructor(private payouts: PayoutsService) {}

  @Roles(UserRole.OWNER)
  @Post()
  @ApiOperation({ summary: "Add a new payout method (Owner only)" })
  create(@Req() req: any, @Body() dto: CreatePayoutMethodDto) {
    return this.payouts.create(req.user.userId, dto);
  }

  @Roles(UserRole.OWNER)
  @Get()
  @ApiOperation({ summary: "Get all payout methods (Owner only)" })
  findAll(@Req() req: any) {
    return this.payouts.findAll(req.user.userId);
  }

  @Roles(UserRole.OWNER)
  @Delete(":id")
  @ApiOperation({ summary: "Delete a payout method (Owner only)" })
  remove(@Req() req: any, @Param("id") id: string) {
    return this.payouts.remove(req.user.userId, id);
  }

  @Roles(UserRole.OWNER)
  @Patch(":id/default")
  @ApiOperation({ summary: "Set a payout method as default (Owner only)" })
  setDefault(@Req() req: any, @Param("id") id: string) {
    return this.payouts.setDefault(req.user.userId, id);
  }

  @Roles(UserRole.OWNER)
  @Post("request")
  @ApiOperation({ summary: "Request a payout (Owner only)" })
  requestPayout(@Req() req: any, @Body() body: { amount: number }) {
    return this.payouts.createPayoutRequest(req.user.userId, body.amount);
  }

  @Roles(UserRole.OWNER)
  @Get("history")
  @ApiOperation({ summary: "Get payout request history (Owner only)" })
  getHistory(@Req() req: any) {
    return this.payouts.getPayoutHistory(req.user.userId);
  }
}
