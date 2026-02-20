import { Module } from "@nestjs/common";
import { HostelsService } from "./hostels.service";
import { HostelsController } from "./hostels.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [PrismaModule, UploadModule, AuditModule],
  providers: [HostelsService],
  controllers: [HostelsController],
  exports: [HostelsService],
})
export class HostelsModule {}
