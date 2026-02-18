import { BadRequestException, Controller, Headers, Post, Req, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Integrations & Webhooks")
@Controller("webhooks")
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private payments: PaymentsService,
        private subscriptions: SubscriptionsService,
        private config: ConfigService
    ) { }

    @Post("paystack")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Handle Paystack webhook events (signature verified)" })
    async handlePaystack(@Req() req: any, @Headers("x-paystack-signature") signature?: string) {
        const secret = this.config.get<string>('paystack.secretKey');
        if (!secret) {
            this.logger.error("PAYSTACK_SECRET_KEY missing for webhook verification");
            throw new BadRequestException("Webhook configuration error");
        }

        const rawBody: Buffer | undefined = req.rawBody;
        if (!rawBody) throw new BadRequestException("Raw body not available for signature check");

        const computed = createHmac("sha512", secret).update(rawBody).digest("hex");

        if (!signature) throw new BadRequestException("Missing signature");

        const sigBuffer = Buffer.from(signature);
        const compBuffer = Buffer.from(computed);

        if (sigBuffer.length !== compBuffer.length || !timingSafeEqual(sigBuffer, compBuffer)) {
            throw new BadRequestException("Invalid webhook signature");
        }

        const event = req.body;
        this.logger.log(`Paystack Webhook Received: ${event?.event} [Ref: ${event?.data?.reference}]`);

        if (event?.event === "charge.success") {
            const reference = event?.data?.reference;
            const paidAt = event?.data?.paid_at;

            if (reference?.startsWith("SUB_PRO_")) {
                await this.subscriptions.handleSubscriptionWebhook(reference, event.data);
            } else if (reference) {
                await this.payments.markPaidFromWebhook(reference, event, paidAt);
            }
        }

        return { received: true };
    }
}
