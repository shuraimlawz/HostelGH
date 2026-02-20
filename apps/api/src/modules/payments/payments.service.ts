import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  BookingStatus,
  PaymentStatus,
  UserRole,
  PaymentProvider,
} from "@prisma/client";
import { PaystackService } from "./paystack.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async initPaystackPayment(
    actor: { userId: string; role: UserRole },
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        tenant: true,
        payment: true,
        hostel: { include: { owner: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
      throw new ForbiddenException("Not authorized to pay for this booking");
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException(
        "Booking must be APPROVED by the owner before payment can be initiated.",
      );
    }

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException("This booking has already been paid for.");
    }

    const COMMISSION_RATE = 0.05; // 5%
    const totalAmount = booking.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    if (totalAmount <= 0)
      throw new BadRequestException("Invalid booking amount");

    const platformFee = Math.round(totalAmount * COMMISSION_RATE);
    const ownerEarnings = totalAmount - platformFee;

    const reference = `HB_${randomBytes(10).toString("hex")}`;

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: PaymentStatus.INITIATED,
        amount: totalAmount,
        platformFee,
        ownerEarnings,
        currency: "GHS",
        reference,
      },
      create: {
        bookingId: booking.id,
        amount: totalAmount,
        platformFee,
        ownerEarnings,
        currency: "GHS",
        reference,
        status: PaymentStatus.INITIATED,
      },
    });

    const appUrl = this.config.get<string>("APP_URL");
    const ownerSubaccountCode = booking.hostel?.owner?.paystackSubaccountCode;

    const initResponse = await this.paystack.initializeTransaction({
      email: booking.tenant.email,
      amount: totalAmount,
      reference,
      callback_url: appUrl ? `${appUrl}/payment/callback` : undefined,
      metadata: { bookingId: booking.id, tenantId: booking.tenantId },
      subaccount: ownerSubaccountCode || undefined,
      bearer: ownerSubaccountCode ? "subaccount" : undefined,
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
      amount: totalAmount,
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
      await this.updatePaymentWebhook(reference, rawWebhook);
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

  private async updatePaymentWebhook(reference: string, rawWebhook: any) {
    await this.prisma.payment.update({
      where: { reference },
      data: { rawWebhook: rawWebhook as any },
    });
  }

  private async completePaymentTransaction(
    reference: string,
    bookingId: string,
    rawWebhook: any,
    paidAt?: string,
  ) {
    // First get the payment to know ownerEarnings
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      select: { ownerEarnings: true },
    });

    const [paymentRow, bookingRow] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { reference },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          rawWebhook: rawWebhook as any,
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
        include: { tenant: true, hostel: { include: { owner: true } } },
      }),
    ]);

    // Increment owner wallet balance
    if (bookingRow.hostel.ownerId && payment?.ownerEarnings) {
      await this.prisma.wallet.upsert({
        where: { ownerId: bookingRow.hostel.ownerId },
        update: {
          balance: { increment: payment.ownerEarnings },
        },
        create: {
          ownerId: bookingRow.hostel.ownerId,
          balance: payment.ownerEarnings,
          hostelId: bookingRow.hostelId,
        },
      });
    }

    return { paymentRow, bookingRow };
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

    if (booking.hostel.owner?.email) {
      this.notifications
        .sendPaymentConfirmedEmail(booking.hostel.owner.email, emailData)
        .catch((e) => console.error("Email failed", e));
    }
    if (booking.hostel.owner?.phone) {
      this.notifications
        .sendPaymentConfirmedSms(booking.hostel.owner.phone, {
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

  async submitOfflineProof(
    userId: string,
    bookingId: string,
    proofUrl: string,
    notes: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking || booking.tenantId !== userId) {
      throw new ForbiddenException(
        "Not authorized to submit proof for this booking",
      );
    }

    // Upsert payment record as OFFLINE
    return this.prisma.payment.upsert({
      where: { bookingId },
      update: {
        status: PaymentStatus.AWAITING_VERIFICATION,
        offlineProofUrl: proofUrl,
        provider: PaymentProvider.OFFLINE,
      },
      create: {
        bookingId,
        amount: 0, // Placeholder, usually would calculate from items
        status: PaymentStatus.AWAITING_VERIFICATION,
        offlineProofUrl: proofUrl,
        provider: PaymentProvider.OFFLINE,
        reference: `OFF_${randomBytes(6).toString("hex")}`,
        currency: "GHS",
      },
    });
  }

  async verifyOfflinePayment(
    adminOrOwnerId: string,
    paymentId: string,
    status: "SUCCESS" | "FAILED",
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: { include: { hostel: true, tenant: true, items: true } },
      },
    });

    if (!payment) throw new NotFoundException("Payment not found");

    const isOwner = payment.booking.hostel.ownerId === adminOrOwnerId;
    // Verify owner/admin
    // ... (assume roles are checked in controller)

    if (status === "SUCCESS") {
      const { paymentRow, bookingRow } = await this.completePaymentTransaction(
        payment.reference,
        payment.bookingId,
        { verifiedBy: adminOrOwnerId },
      );
      this.sendPaymentConfirmationNotifications(
        bookingRow,
        paymentRow,
        payment.reference,
      );
      return paymentRow;
    } else {
      return this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }
}
