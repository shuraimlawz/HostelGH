import { Module } from "@nestjs/common";
import { HostelsService } from "./hostels.service";
import { HostelsController } from "./hostels.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";
import { AuditModule } from "../audit/audit.module";
import { SearchModule } from "../search/search.module";
import { DiscoveryModule } from "../discovery/discovery.module";
import { AIModule } from "../ai/ai.module";

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    AuditModule,
    SearchModule,
    DiscoveryModule,
    AIModule,
  ],
  providers: [HostelsService],

  controllers: [HostelsController],
  exports: [HostelsService],
})
export class HostelsModule {}
