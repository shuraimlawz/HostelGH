import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UserRole } from "@prisma/client";
import { CreateBookingDto } from "./dto/create-booking.dto";

import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Bookings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("bookings")
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Roles(UserRole.TENANT)
  @Post()
  @ApiOperation({ summary: "Create a new booking request (Tenant only)" })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookings.createBooking(req.user.id, dto);
  }

  @Roles(UserRole.TENANT)
  @Get("me")
  myBookings(@Req() req: any) {
    return this.bookings.getMyBookings(req.user.id);
  }

  @Roles(UserRole.OWNER)
  @Get("owner")
  ownerBookings(@Req() req: any) {
    return this.bookings.getOwnerBookings(req.user.id);
  }



  @Roles(UserRole.TENANT, UserRole.ADMIN)
  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel a booking" })
  cancel(@Req() req: any, @Param("id") id: string) {
    return this.bookings.cancelBooking({ id: req.user.id, role: req.user.role }, id);
  }


  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(":id/request-deletion")
  requestDeletion(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { reason: string },
  ) {
    return this.bookings.requestDeletion(
      { id: req.user.id, role: req.user.role },
      id,
      body.reason,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get("pending-deletions")
  getPendingDeletions() {
    return this.bookings.getPendingDeletions();
  }

  @Roles(UserRole.ADMIN)
  @Delete(":id/admin-confirm")
  confirmDeletion(@Param("id") id: string) {
    return this.bookings.confirmDeletion(id);
  }

  @Roles(UserRole.OWNER)
  @Get("owner/analytics")
  @ApiOperation({ summary: "Get booking analytics for owner (Owner only)" })
  ownerAnalytics(@Req() req: any) {
    return this.bookings.getOwnerAnalytics(req.user.id);
  }
}
