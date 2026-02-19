import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HostelsModule } from "../hostels/hostels.module";
import { UsersModule } from "../users/users.module";
import { AdminAuditLogService } from "./admin-audit.service";

@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        HostelsModule,
        UsersModule,
    ],
    controllers: [AdminController],
    providers: [AdminService, AdminAuditLogService],
    exports: [AdminAuditLogService]
})
export class AdminModule { }
