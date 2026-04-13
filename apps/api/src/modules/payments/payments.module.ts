import { Module, forwardRef } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { WebhooksController } from "./webhooks.controller";
import { PaymentsService } from "./payments.service";
import { FeeCalculationService } from "./fee-calculation.service";
import { PaystackService } from "./paystack.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { BookingsModule } from "../bookings/bookings.module";

@Module({
  imports: [NotificationsModule, forwardRef(() => BookingsModule)],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, PaystackService, FeeCalculationService],
  exports: [PaymentsService, PaystackService],
})
export class PaymentsModule {}
