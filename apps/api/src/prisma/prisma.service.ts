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
    if (!connectionString) {
      console.warn("[Prisma] DATABASE_URL is missing! Database operations will fail.");
    }

    try {
      if (connectionString && connectionString.startsWith("postgresql")) {
        const url = new URL(connectionString);
        if (url.searchParams.has("sslmode")) {
          url.searchParams.delete("sslmode");
        }
        connectionString = url.toString();
      }
    } catch (e) {
      console.error("[Prisma] Failed to parse DATABASE_URL:", (e as any).message);
    }


    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("supabase") ? { rejectUnauthorized: false } : false,
    });


    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log("[Prisma] Database connected successfully");
    } catch (error) {
      console.error("[Prisma] Database connection failed during boot:", (error as any).message);
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
