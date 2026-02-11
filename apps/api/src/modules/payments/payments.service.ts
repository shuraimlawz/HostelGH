import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import { PaystackService } from "./paystack.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private paystack: PaystackService,
        private config: ConfigService
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
                currency: "GHS",
                reference,
            },
            create: {
                bookingId: booking.id,
                amount: totalAmount,
                currency: "GHS",
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
            currency: "GHS",
        };
    }

    async verifyPaystackReference(reference: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { reference },
            include: { booking: true }
        });
        if (!payment) throw new NotFoundException("Payment record not found");

        const verification = await this.paystack.verifyTransaction(reference);
        const data = verification?.data;

        const isSuccess = data?.status === "success";

        if (isSuccess) {
            await this.prisma.$transaction([
                this.prisma.payment.update({
                    where: { reference },
                    data: {
                        status: PaymentStatus.SUCCESS,
                        paidAt: data?.paidAt ? new Date(data.paidAt) : new Date(),
                    },
                }),
                this.prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: { status: BookingStatus.CONFIRMED },
                }),
            ]);
        } else {
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

        // Idempotency: skip if already successful
        if (payment.status === PaymentStatus.SUCCESS) {
            await this.prisma.payment.update({
                where: { reference },
                data: { rawWebhook: rawWebhook as any }
            });
            return;
        }

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { reference },
                data: {
                    status: PaymentStatus.SUCCESS,
                    paidAt: paidAt ? new Date(paidAt) : new Date(),
                    rawWebhook: rawWebhook as any,
                },
            }),
            this.prisma.booking.update({
                where: { id: payment.bookingId },
                data: { status: BookingStatus.CONFIRMED },
            }),
        ]);
    }
}
