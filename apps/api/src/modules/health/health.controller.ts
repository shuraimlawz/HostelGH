import { Controller, Get } from '@nestjs/common';

import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("System")
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: "Simple health check" })
    check() {
        return { status: 'ok' };
    }
}

