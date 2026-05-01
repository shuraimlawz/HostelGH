import { Module, forwardRef } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { WebhooksController } from "./webhooks.controller";
import { PaymentsService } from "./payments.service";
import { PaystackService } from "./paystack.service";
import { BankTransferService } from "./bank-transfer.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { BookingsModule } from "../bookings/bookings.module";

@Module({
  imports: [NotificationsModule, forwardRef(() => BookingsModule)],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, PaystackService, BankTransferService],
  exports: [PaymentsService, PaystackService, BankTransferService],
})
export class PaymentsModule {}
