import { Module } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { ConfigModule } from "@nestjs/config";
import { PaymentsModule } from "../payments/payments.module";
import { AdminAuditLogModule } from "../admin/admin-audit.module";

@Module({
  imports: [NotificationsModule, ConfigModule, PaymentsModule, AdminAuditLogModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
