import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
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
        private readonly notifications: NotificationsService
    ) { }

    async initPaystackPayment(actor: { userId: string; role: UserRole }, bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { items: true, tenant: true, payment: true, hostel: true },
        });
        if (!booking) throw new NotFoundException("Booking not found");

        if (!(actor.role === UserRole.ADMIN || booking.tenantId === actor.userId)) {
            throw new ForbiddenException("Not authorized to pay for this booking");
        }

        if (booking.status !== BookingStatus.APPROVED) {
            throw new BadRequestException("Booking must be APPROVED by the owner before payment can be initiated.");
        }

        if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
            throw new BadRequestException("This booking has already been paid for.");
        }

        const totalAmount = booking.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        if (totalAmount <= 0) throw new BadRequestException("Invalid booking amount");

        const reference = `HB_${randomBytes(10).toString("hex")}`;

        const payment = await this.prisma.payment.upsert({
            where: { bookingId: booking.id },
            update: {
                status: PaymentStatus.INITIATED,
                amount: totalAmount,
                currency: "GH₵",
                reference,
            },
            create: {
                bookingId: booking.id,
                amount: totalAmount,
                currency: "GH₵",
                reference,
                status: PaymentStatus.INITIATED,
            },
        });

        const appUrl = this.config.get<string>('APP_URL');
        const initResponse = await this.paystack.initializeTransaction({
            email: booking.tenant.email,
            amount: totalAmount,
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
            amount: totalAmount,
            currency: "GH₵",
        };
    }

    async verifyPaystackReference(reference: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { reference },
            include: { booking: { include: { tenant: true, hostel: { include: { owner: true } } } } }
        });
        if (!payment) throw new NotFoundException("Payment record not found");

        const verification = await this.paystack.verifyTransaction(reference);
        const data = verification?.data;
        const isSuccess = data?.status === "success";

        if (isSuccess && payment.status !== PaymentStatus.SUCCESS) {
            const { paymentRow, bookingRow } = await this.completePaymentTransaction(reference, payment.bookingId, data?.rawWebhook || {});
            this.sendPaymentConfirmationNotifications(bookingRow, paymentRow, reference);
        } else if (!isSuccess) {
            await this.prisma.payment.update({
                where: { reference },
                data: { status: PaymentStatus.FAILED },
            });
        }

        return { ok: true, isSuccess, providerStatus: data?.status };
    }

    async markPaidFromWebhook(reference: string, rawWebhook: any, paidAt?: string) {
        const payment = await this.prisma.payment.findUnique({ where: { reference } });
        if (!payment) return;

        if (payment.status === PaymentStatus.SUCCESS) {
            await this.updatePaymentWebhook(reference, rawWebhook);
            return;
        }

        const { paymentRow, bookingRow } = await this.completePaymentTransaction(reference, payment.bookingId, rawWebhook, paidAt);
        this.sendPaymentConfirmationNotifications(bookingRow, paymentRow, reference);
    }

    private async updatePaymentWebhook(reference: string, rawWebhook: any) {
        await this.prisma.payment.update({
            where: { reference },
            data: { rawWebhook: rawWebhook as any }
        });
    }

    private async completePaymentTransaction(reference: string, bookingId: string, rawWebhook: any, paidAt?: string) {
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
                include: { tenant: true, hostel: { include: { owner: true } } }
            }),
        ]);
        return { paymentRow, bookingRow };
    }

    private sendPaymentConfirmationNotifications(booking: any, payment: any, reference: string) {
        const amountGhs = `GH₵ ${(payment.amount / 100).toFixed(2)}`;
        const emailData = {
            hostelName: booking.hostel.name,
            amount: amountGhs,
            reference,
        };

        this.notifications.sendPaymentConfirmedEmail(booking.tenant.email, emailData).catch(e => console.error("Email failed", e));

        if (booking.hostel.owner?.email) {
            this.notifications.sendPaymentConfirmedEmail(booking.hostel.owner.email, emailData).catch(e => console.error("Email failed", e));
        }
    }
}
