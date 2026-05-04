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
  Delete,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { SubmitProofDto } from "./dto/submit-proof.dto";
import { InitiateBankPaymentDto, SelectPaymentMethodDto, PaymentMethodType } from "./dto/initiate-bank-payment.dto";
import { BankTransferService } from "./bank-transfer.service";
import { Public } from "../../common/decorators/public.decorator";

import { InitiateMoMoPaymentDto } from "./dto/initiate-momo-payment.dto";
import { SubmitMoMoOtpDto } from "./dto/submit-momo-otp.dto";
import { MobileMoneyService } from "./mobile-money.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payments")
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private bankTransfer: BankTransferService,
    private momo: MobileMoneyService,
  ) {}

  // ==================== CARD PAYMENTS (Paystack) ====================

  // ==================== MOBILE MONEY PAYMENTS ====================

  @Post("momo/init")
  @HttpCode(HttpStatus.OK)
  initMoMo(@Req() req: any, @Body() dto: InitiateMoMoPaymentDto) {
    return this.momo.initiatePayment({
      userId: req.user.userId,
      role: req.user.role,
      ...dto,
    });
  }

  @Post("momo/otp")
  @HttpCode(HttpStatus.OK)
  submitMoMoOtp(@Body() dto: SubmitMoMoOtpDto) {
    return this.momo.submitOTP(dto.reference, dto.otp);
  }

  @Get("wallets")
  @HttpCode(HttpStatus.OK)
  getWallets(@Req() req: any) {
    return this.momo.getWallets(req.user.userId);
  }

  @Delete("wallets/:id")
  @HttpCode(HttpStatus.OK)
  removeWallet(@Req() req: any, @Param("id") id: string) {
    return this.momo.removeWallet(req.user.userId, id);
  }

  // ==================== CARD PAYMENTS (Paystack) ====================
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

  // ==================== BANK TRANSFER PAYMENTS ====================

  @Post("bank/init/:bookingId")
  @HttpCode(HttpStatus.OK)
  initBankTransfer(@Req() req: any, @Param("bookingId") bookingId: string) {
    return this.payments.initBankTransferPayment(
      { userId: req.user.userId, role: req.user.role },
      bookingId,
    );
  }

  @Get("bank/list")
  @Public()
  @HttpCode(HttpStatus.OK)
  getBankList() {
    return this.bankTransfer.getBankList();
  }

  @Post("bank/verify/:transferCode")
  @HttpCode(HttpStatus.OK)
  verifyBankTransfer(@Param("transferCode") transferCode: string) {
    return this.bankTransfer.verifyBankTransfer(transferCode);
  }

  @Post("bank/resolve")
  @HttpCode(HttpStatus.OK)
  resolveBankAccount(
    @Body() dto: { accountNumber: string; bankCode: string },
  ) {
    return this.bankTransfer.resolveBankAccount(dto.accountNumber, dto.bankCode);
  }

  // ==================== PAYMENT METHODS ====================

  @Get("methods/:bookingId")
  @HttpCode(HttpStatus.OK)
  getPaymentMethods(@Req() req: any, @Param("bookingId") bookingId: string) {
    return this.payments.getAvailablePaymentMethods(
      { userId: req.user.userId, role: req.user.role },
      bookingId,
    );
  }

  @Post("method/select")
  @HttpCode(HttpStatus.OK)
  selectPaymentMethod(@Req() req: any, @Body() dto: SelectPaymentMethodDto) {
    return this.payments.selectPaymentMethod(
      { userId: req.user.userId, role: req.user.role },
      dto.paymentId,
      dto.method,
    );
  }

  // ==================== PAYMENT HISTORY ====================

  @Get("history")
  getHistory(@Req() req: any) {
    return this.payments.getUserPaymentHistory(req.user.userId);
  }

  @Post(":id")
  getOne(@Param("id") id: string, @Req() req: any) {
    return this.payments.getPaymentById(id, req.user.userId);
  }


}
