import { Body, Controller, Param, Post, Req, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payments")
export class PaymentsController {
    constructor(private payments: PaymentsService) { }

    @Post("paystack/init/:bookingId")
    @HttpCode(HttpStatus.OK)
    init(@Req() req: any, @Param("bookingId") bookingId: string) {
        return this.payments.initPaystackPayment({ userId: req.user.userId, role: req.user.role }, bookingId);
    }

    @Post("paystack/verify")
    @HttpCode(HttpStatus.OK)
    verify(@Body() dto: VerifyPaymentDto) {
        return this.payments.verifyPaystackReference(dto.reference);
    }
}

