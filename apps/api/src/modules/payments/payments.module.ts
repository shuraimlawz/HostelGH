import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { WebhooksController } from "./webhooks.controller";
import { PaymentsService } from "./payments.service";
import { FeeCalculationService } from "./fee-calculation.service";
import { PaystackService } from "./paystack.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, PaystackService, FeeCalculationService],
  exports: [PaymentsService, PaystackService],
})
export class PaymentsModule {}
