import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AIService } from "./ai.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("AI")
@Controller("ai")
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post("parse-search")
  @ApiOperation({ summary: "Parse a natural language search query" })
  async parseSearch(@Body("query") query: string) {
    return this.aiService.parseSearchQuery(query);
  }

  @Post("polish-description")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Polish a hostel description (Owners only)" })
  async polishDescription(@Body("description") description: string) {
    const polished = await this.aiService.polishDescription(description);
    return { polished };
  }
}
