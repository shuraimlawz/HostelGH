import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let connectionString = process.env.DATABASE_URL || "";

    // Remove sslmode=require if present to avoid dual-validation conflicts with node-postgres and Prisma
    const url = new URL(connectionString);
    if (url.searchParams.has("sslmode")) {
      url.searchParams.delete("sslmode");
    }
    connectionString = url.toString();

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks() {
    process.on("beforeExit", async () => {
      await this.$disconnect();
    });
  }
}
