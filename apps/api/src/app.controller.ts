import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("App")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "Health check / Welcome message" })
  getHello(): string {
    return "HostelGH API is running 🚀";
  }
}
