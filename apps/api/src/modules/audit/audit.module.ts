import { Module, Global } from "@nestjs/common";
import { AdminAuditLogService } from "../admin/admin-audit.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AdminAuditLogService],
  exports: [AdminAuditLogService],
})
export class AuditModule {}
