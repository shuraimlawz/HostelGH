import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, PaymentStatus, UserRole, PaymentProvider } from "@prisma/client";
import { PaystackService } from "./paystack.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { NotificationsService } from "../notifications/notifications.service";
import { BookingsService } from "../bookings/bookings.service";

@Injectable()
export class PaymentsService {
  private readonly PLATFORM_FEE = 2000; // 20 GHS in pesewas

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
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
}
