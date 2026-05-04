import { Module, forwardRef } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { WebhooksController } from "./webhooks.controller";
import { PaymentsService } from "./payments.service";
import { PaystackService } from "./paystack.service";
import { BankTransferService } from "./bank-transfer.service";
import { MobileMoneyService } from "./mobile-money.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { BookingsModule } from "../bookings/bookings.module";

@Module({
  imports: [NotificationsModule, forwardRef(() => BookingsModule)],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, PaystackService, BankTransferService, MobileMoneyService],
  exports: [PaymentsService, PaystackService, BankTransferService, MobileMoneyService],
})
export class PaymentsModule {}
