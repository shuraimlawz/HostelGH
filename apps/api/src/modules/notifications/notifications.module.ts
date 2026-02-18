import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { NotificationsService } from "./notifications.service";
import { SmsService } from "./sms.service";

@Module({
    providers: [EmailService, NotificationsService, SmsService],
    exports: [NotificationsService, SmsService],
})
export class NotificationsModule { }
