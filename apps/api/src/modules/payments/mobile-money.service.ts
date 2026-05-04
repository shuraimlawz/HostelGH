import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PaystackService } from "./paystack.service";
import { PaymentStatus, UserRole, PaymentMethod } from "@prisma/client";
import { randomBytes } from "crypto";

@Injectable()
export class MobileMoneyService {
  private readonly MOMO_FEE = 200; // 2 GHS in pesewas
  private readonly PLATFORM_FEE = 500; // 5 GHS

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
  ) {}

  async initiatePayment(params: {
    userId: string;
    role: UserRole;
    bookingId: string;
    phoneNumber: string;
    provider: string; // mtn, vodafone, airteltigo
    saveWallet?: boolean;
  }) {
    const { userId, role, bookingId, phoneNumber, provider, saveWallet } = params;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true, payment: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (role !== UserRole.ADMIN && booking.tenantId !== userId) {
      throw new ForbiddenException("Not authorized to pay for this booking");
    }

    const totalAmount = this.PLATFORM_FEE + this.MOMO_FEE;
    const reference = `MOMO_${randomBytes(10).toString("hex")}`;

    // Update or create payment record
    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      update: {
        method: PaymentMethod.MOBILE_MONEY,
        status: PaymentStatus.INITIATED,
        amount: totalAmount,
        reference,
        momoProvider: provider.toUpperCase(),
        momoPhoneNumber: phoneNumber,
      },
      create: {
        bookingId,
        method: PaymentMethod.MOBILE_MONEY,
        status: PaymentStatus.INITIATED,
        amount: totalAmount,
        reference,
        momoProvider: provider.toUpperCase(),
        momoPhoneNumber: phoneNumber,
      },
    });

    // Save wallet if requested
    if (saveWallet) {
      await this.prisma.wallet.upsert({
        where: {
          userId_provider_phoneNumber: {
            userId,
            provider: provider.toUpperCase(),
            phoneNumber,
          },
        },
        update: { status: "active" },
        create: {
          userId,
          provider: provider.toUpperCase(),
          phoneNumber,
        },
      });
    }

    // Call Paystack Charge API
    const chargeRes = await this.paystack.chargeMobileMoney({
      email: booking.tenant.email,
      amount: totalAmount,
      reference,
      currency: "GHS",
      mobile_money: {
        phone: phoneNumber,
        provider: provider.toLowerCase(),
      },
      metadata: { bookingId, paymentId: payment.id },
    });

    // Handle initial response (might require OTP or just be pending)
    // Paystack charge response structure: { status: true, message: "...", data: { status: "send_otp", reference: "..." } }
    const data = chargeRes.data;
    const chargeStatus = data?.status;
    const displayText = data?.display_text || "Check your phone for the payment prompt.";

    if (chargeStatus === "send_otp") {
      return {
        status: "send_otp",
        reference,
        message: "Please enter the OTP sent to your phone.",
      };
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PENDING },
    });

    return {
      status: "pending",
      reference,
      message: displayText,
    };
  }

  async submitOTP(reference: string, otp: string) {
    const res = await this.paystack.submitOTP(reference, otp);
    const data = res.data;
    
    return {
      status: data?.status || "pending",
      message: data?.display_text || "Payment is processing.",
    };
  }

  async getWallets(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId, status: "active" },
    });
  }

  async removeWallet(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException("Wallet not found");
    }

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { status: "deleted" },
    });
  }
}
