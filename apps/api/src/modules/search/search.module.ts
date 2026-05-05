import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { HostelProcessor } from "./hostel.processor";

@Module({
  imports: [
    PrismaModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>("ELASTICSEARCH_NODE") || "http://localhost:9200",
        maxRetries: 5,
        requestTimeout: 10000,
        sniffOnStart: false,
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: "hostel-indexing",
    }),
  ],
  providers: [SearchService, HostelProcessor],
  exports: [SearchService, BullModule],
})
export class SearchModule {}
