import { Module, forwardRef } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { ConfigModule } from "@nestjs/config";
import { PaymentsModule } from "../payments/payments.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [NotificationsModule, ConfigModule, forwardRef(() => PaymentsModule), AuditModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
