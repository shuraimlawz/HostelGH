import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DiscoveryService } from "./discovery.service";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Discovery")
@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get optimized discovery data for home page" })
  getDiscovery() {
    return this.discoveryService.getDiscovery();
  }
}
