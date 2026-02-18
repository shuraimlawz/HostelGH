import { Injectable } from "@nestjs/common";
import { EmailService } from "./email.service";
import { bookingRequestedTemplate } from "./templates/booking-requested";
import { bookingApprovedTemplate } from "./templates/booking-approved";
import { bookingRejectedTemplate } from "./templates/booking-rejected";
import { paymentConfirmedTemplate } from "./templates/payment-confirmed";
import { broadcastTemplate } from "./templates/broadcast";
import { SmsService } from "./sms.service";

interface EmailPayloadBase {
    hostelName: string;
}

interface BookingRequestPayload extends EmailPayloadBase {
    tenantName: string;
    startDate: string;
    endDate: string;
}

interface BookingApprovedPayload extends EmailPayloadBase {
    startDate: string;
    endDate: string;
}

interface BookingRejectedPayload extends EmailPayloadBase {
    reason?: string;
}

interface PaymentConfirmedPayload extends EmailPayloadBase {
    amount: string;
    reference: string;
}

interface BroadcastPayload {
    title: string;
    message: string;
    type: string;
}

@Injectable()
export class NotificationsService {
    constructor(
        private email: EmailService,
        private sms: SmsService
    ) { }

    async sendBookingRequestEmail(
        ownerEmail: string,
        payload: BookingRequestPayload,
    ) {
        return this.email.send({
            to: ownerEmail,
            subject: `New booking request • ${payload.hostelName}`,
            html: bookingRequestedTemplate(payload),
        });
    }

    async sendBookingApprovedEmail(
        tenantEmail: string,
        payload: BookingApprovedPayload,
    ) {
        return this.email.send({
            to: tenantEmail,
            subject: `Booking approved • ${payload.hostelName}`,
            html: bookingApprovedTemplate(payload),
        });
    }

    async sendBookingRejectedEmail(
        tenantEmail: string,
        payload: BookingRejectedPayload,
    ) {
        return this.email.send({
            to: tenantEmail,
            subject: `Booking update • ${payload.hostelName}`,
            html: bookingRejectedTemplate(payload),
        });
    }

    async sendPaymentConfirmedEmail(
        to: string,
        payload: PaymentConfirmedPayload,
    ) {
        return this.email.send({
            to,
            subject: `Payment confirmed • ${payload.hostelName}`,
            html: paymentConfirmedTemplate(payload),
        });
    }

    async sendBookingRequestSms(to: string, payload: { tenantName: string; hostelName: string }) {
        const message = `New booking request for ${payload.hostelName} from ${payload.tenantName}. Log in to HostelGH to approve.`;
        return this.sms.sendSms(to, message);
    }

    async sendBookingApprovedSms(to: string, payload: { hostelName: string }) {
        const message = `Good news! Your booking for ${payload.hostelName} has been approved. Please complete your payment on HostelGH within 24 hours.`;
        return this.sms.sendSms(to, message);
    }

    async sendPaymentConfirmedSms(to: string, payload: { hostelName: string; amount: string }) {
        const message = `Payment of ${payload.amount} for ${payload.hostelName} confirmed. Your slot is now locked. Welcome home!`;
        return this.sms.sendSms(to, message);
    }

    async sendBroadcastEmail(
        to: string,
        payload: BroadcastPayload,
    ) {
        return this.email.send({
            to,
            subject: `${payload.title} • HostelGH`,
            html: broadcastTemplate(payload),
        });
    }
}
