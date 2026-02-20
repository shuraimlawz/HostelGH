import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HostelsModule } from "../hostels/hostels.module";
import { UsersModule } from "../users/users.module";
import { AuditModule } from "../audit/audit.module";

@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        HostelsModule,
        UsersModule,
        AuditModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
