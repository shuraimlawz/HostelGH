import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { DisputesService } from "./disputes.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole, DisputeStatus } from "@prisma/client";
import { CreateDisputeDto } from "./dto/create-dispute.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Disputes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("disputes")
export class DisputesController {
  constructor(private disputes: DisputesService) {}

  @Post()
  @ApiOperation({ summary: "Raise a new dispute" })
  create(@Body() dto: CreateDisputeDto) {
    return this.disputes.createDispute(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get dispute details" })
  get(@Param("id") id: string) {
    return this.disputes.getDispute(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":id/resolve")
  @ApiOperation({ summary: "Resolve a dispute (Admin only)" })
  resolve(@Param("id") id: string, @Body() body: { status: DisputeStatus }) {
    return this.disputes.resolveDispute(id, body.status);
  }

  @Get("booking/:bookingId")
  @ApiOperation({ summary: "Get disputes for a booking" })
  getByBooking(@Param("bookingId") bookingId: string) {
    return this.disputes.getDisputesByBooking(bookingId);
  }
}
