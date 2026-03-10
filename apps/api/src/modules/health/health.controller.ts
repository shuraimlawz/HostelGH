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
      // Perform a light query to verify database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: "down",
        database: "disconnected",
        error: error.message
      });
    }
  }
}
