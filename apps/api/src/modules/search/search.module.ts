import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { HostelProcessor } from "./hostel.processor";
import { Meilisearch } from "meilisearch";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "hostel-indexing",
    }),
  ],
  providers: [
    SearchService,
    HostelProcessor,
    {
      provide: "MEILISEARCH_CLIENT",
      useFactory: (config: ConfigService) => {
        const host = config.get<string>("MEILISEARCH_HOST") || "http://localhost:7700";
        const apiKey = config.get<string>("MEILISEARCH_KEY");
        return new Meilisearch({ host, apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SearchService, BullModule],
})
export class SearchModule {}
