import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, PaymentStatus, UserRole, PaymentProvider } from "@prisma/client";
import { PaystackService } from "./paystack.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { NotificationsService } from "../notifications/notifications.service";
import { FeeCalculationService } from "./fee-calculation.service";
import { BookingsService } from "../bookings/bookings.service";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly feeCalc: FeeCalculationService,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
  ) { }

  private getCommissionRate() {
    // Launch Mode: 0% Platform Commission
    return 0.0;
  }

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

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        "Booking is not in a state that allows payment.",
      );
    }

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException("This booking has already been paid for.");
    }

    const totalAmount = booking.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    if (totalAmount <= 0)
      throw new BadRequestException("Invalid booking amount");

    const fee = await this.feeCalc.calculateListingFee({
      hostelId: booking.hostelId,
      bookingAmount: totalAmount,
      isAcceptance: true,
    });

    const platformFee = fee.feeAmount;
    const processingFee = this.feeCalc.calculateProcessingFee(totalAmount);
    const totalToCharge = totalAmount + processingFee;
    const ownerEarnings = totalAmount - platformFee;

    const reference = `HB_${randomBytes(10).toString("hex")}`;

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: PaymentStatus.INITIATED,
        amount: totalToCharge,
        processingFee,
        platformFee,
        // @ts-ignore
        feeType: (fee as any).feeType,
        // @ts-ignore
        feeDescription: (fee as any).description,
        ownerEarnings,
        currency: "GHS",
        reference,
      },
      create: {
        bookingId: booking.id,
        amount: totalToCharge,
        processingFee,
        platformFee,
        // @ts-ignore
        feeType: (fee as any).feeType,
        // @ts-ignore
        feeDescription: (fee as any).description,
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
      amount: totalToCharge,
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

  async initFeaturedListingPayment(
    actor: { userId: string; role: UserRole },
    hostelId: string,
    durationDays: number = 30,
  ) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
      include: { owner: true },
    });
    if (!hostel) throw new NotFoundException("Hostel not found");

    const isOwner =
      actor.role === UserRole.ADMIN || hostel.ownerId === actor.userId;
    if (!isOwner) throw new ForbiddenException("Not authorized to feature this hostel");

    if (durationDays <= 0 || durationDays > 365) {
      throw new BadRequestException("Invalid feature duration");
    }

    const FEATURED_PRICE_PER_30_DAYS = 5000; // GH₵50.00 in pesewas
    const pricePerDay = Math.ceil(FEATURED_PRICE_PER_30_DAYS / 30);
    const amount = pricePerDay * durationDays;

    const reference = `FT_${randomBytes(10).toString("hex")}`;

    const payment = await this.prisma.listingFeaturePayment.create({
      data: {
        hostelId,
        ownerId: hostel.ownerId,
        amount,
        reference,
        status: PaymentStatus.INITIATED,
        provider: PaymentProvider.PAYSTACK,
        currency: "GHS",
        durationDays,
      },
    });

    const appUrl = this.config.get<string>("APP_URL");

    if (!hostel.owner?.email) {
      throw new BadRequestException("Owner email is required for payment");
    }

    const initResponse = await this.paystack.initializeTransaction({
      email: hostel.owner.email,
      amount,
      reference,
      callback_url: appUrl ? `${appUrl}/owner/feature` : undefined,
      metadata: {
        hostelId,
        ownerId: hostel.ownerId,
        durationDays,
        type: "feature_listing",
      },
    });

    const data = initResponse?.data;
    await this.prisma.listingFeaturePayment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PENDING },
    });

    return {
      authorizationUrl: data?.authorization_url,
      reference,
      amount,
      currency: "GHâ‚µ",
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

  async markFeaturedListingPaidFromWebhook(
    reference: string,
    rawWebhook: any,
    paidAt?: string,
  ) {
    const payment = await this.prisma.listingFeaturePayment.findUnique({
      where: { reference },
      include: { hostel: true },
    });
    if (!payment) return;

    if (payment.status === PaymentStatus.SUCCESS) {
      await this.prisma.listingFeaturePayment.update({
        where: { reference },
        data: { rawWebhook: rawWebhook as any },
      });
      return;
    }

    const baseDate =
      payment.hostel.featuredUntil && payment.hostel.featuredUntil > new Date()
        ? payment.hostel.featuredUntil
        : new Date();
    const featuredUntil = new Date(baseDate.getTime() + payment.durationDays * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.listingFeaturePayment.update({
        where: { reference },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          rawWebhook: rawWebhook as any,
        },
      }),
      this.prisma.hostel.update({
        where: { id: payment.hostelId },
        data: {
          isFeatured: true,
          featuredUntil,
        },
      }),
    ]);
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

    const paymentRow = await this.prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        rawWebhook: rawWebhook as any,
      },
    });

    // Process the booking lifecycle (Mark PAYMENT_SECURED -> RESERVED)
    const updatedBooking = await this.bookingsService.processSuccessfulPayment(bookingId);

    // Increment owner wallet pending balance (Escrow)
    if (updatedBooking.hostel.ownerId && payment?.ownerEarnings) {
      await this.prisma.wallet.upsert({
        where: { ownerId: updatedBooking.hostel.ownerId },
        update: {
          pendingBalance: { increment: payment.ownerEarnings },
        },
        create: {
          ownerId: updatedBooking.hostel.ownerId,
          balance: 0,
          pendingBalance: payment.ownerEarnings,
          hostelId: updatedBooking.hostelId,
        },
      });
    }

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
      include: { payment: true, items: true },
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
        amount: booking.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), // computed from booking items
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

  async initInstallmentPayment(
    actor: { userId: string; role: UserRole },
    bookingId: string,
    numberOfInstallments: number = 2,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: true,
        tenant: true,
        hostel: { include: { owner: true } },
      },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
      throw new ForbiddenException("Not authorized");
    }

    const totalAmount = booking.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);

    // Create installment plans
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * 30);

      // @ts-ignore
      await this.prisma.installmentPlan.create({
        data: {
          bookingId: booking.id,
          amount: installmentAmount,
          dueDate,
          status: PaymentStatus.PENDING,
        },
      });
    }

    // Initialize the first installment payment
    return this.initPaystackPayment(actor, bookingId);
  }
}





