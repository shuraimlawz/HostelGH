import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { SubmitProofDto } from "./dto/submit-proof.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("paystack/init/:bookingId")
  @HttpCode(HttpStatus.OK)
  init(@Req() req: any, @Param("bookingId") bookingId: string) {
    return this.payments.initPaystackPayment(
      { userId: req.user.userId, role: req.user.role },
      bookingId,
    );
  }

  @Post("paystack/verify")
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyPaymentDto) {
    return this.payments.verifyPaystackReference(dto.reference);
  }

  @Get("history")
  getHistory(@Req() req: any) {
    return this.payments.getUserPaymentHistory(req.user.userId);
  }

  @Post(":id")
  getOne(@Param("id") id: string, @Req() req: any) {
    return this.payments.getPaymentById(id, req.user.userId);
  }

  @Post("offline/submit/:bookingId")
  @Roles(UserRole.TENANT)
  submitProof(
    @Req() req: any,
    @Param("bookingId") bookingId: string,
    @Body() dto: SubmitProofDto,
  ) {
    return this.payments.submitOfflineProof(
      req.user.userId,
      bookingId,
      dto.proofUrl,
      dto.notes,
    );
  }

  @Post("offline/verify/:paymentId")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  verifyOffline(
    @Req() req: any,
    @Param("paymentId") paymentId: string,
    @Body("status") status: "SUCCESS" | "FAILED",
  ) {
    return this.payments.verifyOfflinePayment(
      req.user.userId,
      paymentId,
      status,
    );
  }

  @Post("feature/init/:hostelId")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  initFeaturePayment(
    @Req() req: any,
    @Param("hostelId") hostelId: string,
    @Body("durationDays") durationDays?: number,
  ) {
    const days = durationDays ? Number(durationDays) : undefined;
    return this.payments.initFeaturedListingPayment(
      { userId: req.user.userId, role: req.user.role },
      hostelId,
      days,
    );
  }
}
