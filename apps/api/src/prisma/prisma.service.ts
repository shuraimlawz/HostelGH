import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // pg-connection-string forces strict cert verification if it sees sslmode=require, 
    // completely ignoring our custom 'ssl' configuration override unless we strip it out.
    const connectionString = process.env.DATABASE_URL
      ?.replace("?sslmode=require", "")
      ?.replace("&sslmode=require", "?") // Fixes query string joining if it was the first param
      ?.replace("?pgbouncer=true?", "?pgbouncer=true"); // Cleanup just in case

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
