import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { WebhooksController } from "./webhooks.controller";
import { PaymentsService } from "./payments.service";
import { PaystackService } from "./paystack.service";

@Module({
    controllers: [PaymentsController, WebhooksController],
    providers: [PaymentsService, PaystackService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
