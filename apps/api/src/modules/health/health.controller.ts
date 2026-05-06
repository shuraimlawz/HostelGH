import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("System")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  @ApiOperation({ summary: "Simple health check with database ping" })
  async check() {
    try {
      // Real database ping
      await this.prisma.$queryRaw`SELECT 1`;
      
      const uptime = process.uptime();
      const memory = process.memoryUsage();
      
      return {
        status: "ok",
        database: "connected",
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memoryUsage: {
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
          rss: `${Math.round(memory.rss / 1024 / 1024)} MB`
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const uptime = process.uptime();
      throw new ServiceUnavailableException({
        status: "down",
        database: "disconnected",
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        error: (error as any).message
      });
    }
  }
}
