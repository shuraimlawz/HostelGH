import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminGateway } from "./admin.gateway";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HostelsModule } from "../hostels/hostels.module";
import { UsersModule } from "../users/users.module";
import { AuditModule } from "../audit/audit.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    HostelsModule,
    UsersModule,
    AuditModule,
    JwtModule.register({}),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGateway],
  exports: [AdminService],
})
export class AdminModule { }
