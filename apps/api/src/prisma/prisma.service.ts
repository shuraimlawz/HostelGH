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

    try {
      if (connectionString) {
        // Remove sslmode=require if present to avoid dual-validation conflicts with node-postgres and Prisma
        const url = new URL(connectionString);
        if (url.searchParams.has("sslmode")) {
          url.searchParams.delete("sslmode");
        }
        connectionString = url.toString();
      }
    } catch (e) {
      console.error("[Prisma] Failed to parse DATABASE_URL, using raw string:", e.message);
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log("[Prisma] Database connected successfully");
    } catch (error) {
      console.error("[Prisma] Database connection failed during boot:", error.message);
      // We don't throw here to allow the app to boot and show errors via health check/filter
    }
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
