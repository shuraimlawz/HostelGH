import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, PaymentStatus, UserRole, PaymentProvider, PaymentMethod } from "@prisma/client";
import { PaystackService } from "./paystack.service";
import { BankTransferService } from "./bank-transfer.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { NotificationsService } from "../notifications/notifications.service";
import { BookingsService } from "../bookings/bookings.service";
import { PaymentMethodType } from "./dto/initiate-bank-payment.dto";

@Injectable()
export class PaymentsService {
  private readonly PLATFORM_FEE = 500; // 5 GHS in pesewas
  private readonly BANK_TRANSFER_FEE = 300; // 3 GHS in pesewas

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly bankTransfer: BankTransferService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
  ) { }

  async initPaystackPayment(
    actor: { userId: string; role: UserRole },
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tenant: true,
        payment: true,
        hostel: { include: { owner: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
      throw new ForbiddenException("Not authorized to pay for this booking");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException("Booking is not in a state that allows payment.");
    }

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException("This booking has already been paid for.");
    }

    const reference = `HB_${randomBytes(10).toString("hex")}`;

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: PaymentStatus.INITIATED,
        amount: this.PLATFORM_FEE,
        currency: "GHS",
        reference,
      },
      create: {
        bookingId: booking.id,
        amount: this.PLATFORM_FEE,
        currency: "GHS",
        reference,
        status: PaymentStatus.INITIATED,
      },
    });

    const appUrl = this.config.get<string>("APP_URL");

    const initResponse = await this.paystack.initializeTransaction({
      email: booking.tenant.email,
      amount: this.PLATFORM_FEE,
      reference,
      callback_url: appUrl ? `${appUrl}/payment/callback` : undefined,
      metadata: { bookingId: booking.id, tenantId: booking.tenantId },
    });

    const data = initResponse?.data;
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PENDING,
        authorizationUrl: data?.authorization_url ?? null,
        accessCode: data?.access_code ?? null,
      },
    });

    return {
      authorizationUrl: data?.authorization_url,
      reference,
      amount: this.PLATFORM_FEE,
      currency: "GH₵",
    };
  }

  async verifyPaystackReference(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: {
        booking: {
          include: { tenant: true, hostel: { include: { owner: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundException("Payment record not found");

    const verification = await this.paystack.verifyTransaction(reference);
    const data = verification?.data;
    const isSuccess = data?.status === "success";

    if (isSuccess && payment.status !== PaymentStatus.SUCCESS) {
      const { paymentRow, bookingRow } = await this.completePaymentTransaction(
        reference,
        payment.bookingId,
        data?.rawWebhook || {},
      );
      this.sendPaymentConfirmationNotifications(
        bookingRow,
        paymentRow,
        reference,
      );
    } else if (!isSuccess) {
      await this.prisma.payment.update({
        where: { reference },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { ok: true, isSuccess, providerStatus: data?.status };
  }

  async markPaidFromWebhook(
    reference: string,
    rawWebhook: any,
    paidAt?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
    });
    if (!payment) return;

    if (payment.status === PaymentStatus.SUCCESS) {
      await this.prisma.payment.update({
        where: { reference },
        data: { rawWebhook: rawWebhook as any },
      });
      return;
    }

    const { paymentRow, bookingRow } = await this.completePaymentTransaction(
      reference,
      payment.bookingId,
      rawWebhook,
      paidAt,
    );
    this.sendPaymentConfirmationNotifications(
      bookingRow,
      paymentRow,
      reference,
    );
  }

  private async completePaymentTransaction(
    reference: string,
    bookingId: string,
    rawWebhook: any,
    paidAt?: string,
  ) {
    const paymentRow = await this.prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        rawWebhook: rawWebhook as any,
      },
    });

    const updatedBooking = await this.bookingsService.processSuccessfulPayment(bookingId);

    return { paymentRow, bookingRow: updatedBooking };
  }

  private sendPaymentConfirmationNotifications(
    booking: any,
    payment: any,
    reference: string,
  ) {
    const amountGhs = `GH₵ ${(payment.amount / 100).toFixed(2)}`;
    const emailData = {
      hostelName: booking.hostel.name,
      amount: amountGhs,
      reference,
    };

    this.notifications
      .sendPaymentConfirmedEmail(booking.tenant.email, emailData)
      .catch((e) => console.error("Email failed", e));
    if (booking.tenant.phone) {
      this.notifications
        .sendPaymentConfirmedSms(booking.tenant.phone, {
          hostelName: booking.hostel.name,
          amount: amountGhs,
        })
        .catch((e) => console.error("SMS failed", e));
    }
  }

  async getUserPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        booking: {
          tenantId: userId,
        },
        status: PaymentStatus.SUCCESS,
      },
      include: {
        booking: {
          include: {
            hostel: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPaymentById(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            hostel: true,
            tenant: true,
          },
        },
      },
    });

    if (!payment) throw new NotFoundException("Payment not found");

    if (
      payment.booking.tenantId !== userId &&
      payment.booking.hostel.ownerId !== userId
    ) {
      throw new ForbiddenException(
        "You are not authorized to view this payment.",
      );
    }

    return payment;
  }

  // ==================== BANK TRANSFER PAYMENTS ====================

  async initBankTransferPayment(
    actor: { userId: string; role: UserRole },
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tenant: true,
        payment: true,
        hostel: { include: { owner: true } },
      },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
      throw new ForbiddenException("Not authorized to pay for this booking");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException("Booking is not in a state that allows payment.");
    }

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException("This booking has already been paid for.");
    }

    const reference = `BANK_${randomBytes(10).toString("hex")}`;
    const totalAmount = this.PLATFORM_FEE + this.BANK_TRANSFER_FEE;

    // Create payment record for bank transfer
    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: PaymentStatus.AWAITING_VERIFICATION,
        method: PaymentMethod.BANK_TRANSFER,
        provider: PaymentProvider.PAYSTACK,
        amount: totalAmount,
        currency: "GHS",
        reference,
      },
      create: {
        bookingId: booking.id,
        method: PaymentMethod.BANK_TRANSFER,
        provider: PaymentProvider.PAYSTACK,
        amount: totalAmount,
        currency: "GHS",
        reference,
        status: PaymentStatus.AWAITING_VERIFICATION,
      },
    });

    // Initiate bank transfer via Paystack
    const bankTransferDetails = await this.bankTransfer.initiateBankTransfer(
      this.PLATFORM_FEE,
      reference,
      { bookingId: booking.id, tenantId: booking.tenantId },
    );

    // Update payment with bank details
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        bankName: bankTransferDetails.bank_name,
        accountNumber: bankTransferDetails.account_number,
        accountName: bankTransferDetails.account_name,
      },
    });

    return {
      paymentId: payment.id,
      reference,
      bank: {
        name: bankTransferDetails.bank_name,
        accountNumber: bankTransferDetails.account_number,
        accountName: bankTransferDetails.account_name,
      },
      amount: totalAmount,
      amountBreakdown: {
        bookingFee: this.PLATFORM_FEE,
        bankFee: this.BANK_TRANSFER_FEE,
        total: totalAmount,
      },
      currency: "GHS",
      instructions:
        "Transfer the exact amount to the bank account above. Use reference code in transfer description.",
      referenceCode: reference,
    };
  }

  async verifyBankTransferAndConfirm(
    reference: string,
    transferCode: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: {
        booking: {
          include: { tenant: true, hostel: { include: { owner: true } } },
        },
      },
    });

    if (!payment) throw new NotFoundException("Payment record not found");

    // Verify transfer status with Paystack
    const verification = await this.bankTransfer.verifyBankTransfer(transferCode);

    if (verification.status === "success" || verification.status === "completed") {
      if (payment.status !== PaymentStatus.SUCCESS) {
        const { paymentRow, bookingRow } = await this.completePaymentTransaction(
          reference,
          payment.bookingId,
          verification,
        );

        this.sendBankTransferConfirmationNotifications(bookingRow, paymentRow, reference);
      }

      return { ok: true, status: "success", message: "Payment confirmed" };
    } else if (verification.status === "pending") {
      return {
        ok: true,
        status: "pending",
        message: "Payment is pending. Please wait for confirmation.",
      };
    } else {
      await this.prisma.payment.update({
        where: { reference },
        data: { status: PaymentStatus.FAILED },
      });

      return {
        ok: false,
        status: "failed",
        message: "Payment verification failed",
      };
    }
  }

  private sendBankTransferConfirmationNotifications(
    booking: any,
    payment: any,
    reference: string,
  ) {
    const amountGhs = `GH₵ ${(payment.amount / 100).toFixed(2)}`;
    const emailData = {
      hostelName: booking.hostel.name,
      amount: amountGhs,
      reference,
    };

    this.notifications
      .sendPaymentConfirmedEmail(booking.tenant.email, emailData)
      .catch((e) => console.error("Email failed", e));

    if (booking.tenant.phone) {
      this.notifications
        .sendPaymentConfirmedSms(booking.tenant.phone, {
          hostelName: booking.hostel.name,
          amount: amountGhs,
        })
        .catch((e) => console.error("SMS failed", e));
    }
  }

  // ==================== PAYMENT METHODS ====================

  async getAvailablePaymentMethods(
    actor: { userId: string; role: UserRole },
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true, items: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
      throw new ForbiddenException("Not authorized");
    }

    // Calculate total booking amount from items
    const totalAmount = booking.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return {
      methods: [
        {
          type: PaymentMethodType.CARD,
          label: "Card Payment",
          description: "Pay using Visa, Mastercard via Paystack",
          fees: 0,
          processingTime: "Instant",
          available: true,
        },
        {
          type: PaymentMethodType.BANK_TRANSFER,
          label: "Bank Transfer",
          description: "Direct transfer to HostelGH's bank account",
          fees: this.BANK_TRANSFER_FEE,
          processingTime: "1-5 minutes",
          available: true,
        },
        {
          type: PaymentMethodType.USSD,
          label: "USSD",
          description: "Pay using USSD codes (*737#, *389#, etc.)",
          fees: 100,
          processingTime: "Instant",
          available: true,
        },
        {
          type: PaymentMethodType.MOBILE_MONEY,
          label: "Mobile Money",
          description: "Pay via MTN, Vodafone, or AirtelTigo Mobile Money",
          fees: 200,
          processingTime: "1-2 minutes",
          available: true,
        },
      ],
      amount: totalAmount,
      bookingId,
    };
  }

  async selectPaymentMethod(
    actor: { userId: string; role: UserRole },
    paymentId: string,
    method: PaymentMethodType,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) throw new NotFoundException("Payment not found");

    if (
      !(actor.role === UserRole.ADMIN || payment.booking.tenantId === actor.userId)
    ) {
      throw new ForbiddenException("Not authorized");
    }

    // Map PaymentMethodType to PaymentMethod enum
    const methodMap: Record<PaymentMethodType, PaymentMethod> = {
      [PaymentMethodType.CARD]: PaymentMethod.CARD,
      [PaymentMethodType.BANK_TRANSFER]: PaymentMethod.BANK_TRANSFER,
      [PaymentMethodType.USSD]: PaymentMethod.USSD,
      [PaymentMethodType.MOBILE_MONEY]: PaymentMethod.MOBILE_MONEY,
    };

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { method: methodMap[method] },
    });

    return {
      ok: true,
      paymentId: updatedPayment.id,
      selectedMethod: method,
      message: `Payment method changed to ${method}`,
    };
  }
}
