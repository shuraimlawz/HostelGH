import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { NotificationsService } from "./notifications.service";
import { SmsService } from "./sms.service";
import { PushNotificationService } from "./push.service";

@Module({
  providers: [EmailService, NotificationsService, SmsService, PushNotificationService],
  exports: [NotificationsService, SmsService, PushNotificationService],
})
export class NotificationsModule { }
