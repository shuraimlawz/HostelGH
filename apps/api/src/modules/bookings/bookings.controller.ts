import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
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
    constructor(private bookings: BookingsService) { }

    @Roles(UserRole.TENANT)
    @Post()
    @ApiOperation({ summary: "Create a new booking request (Tenant only)" })
    create(@Req() req: any, @Body() dto: CreateBookingDto) {
        return this.bookings.createBooking(req.user.userId, dto);
    }

    @Roles(UserRole.TENANT)
    @Get("me")
    myBookings(@Req() req: any) {
        return this.bookings.getMyBookings(req.user.userId);
    }

    @Roles(UserRole.OWNER)
    @Get("owner")
    ownerBookings(@Req() req: any) {
        return this.bookings.getOwnerBookings(req.user.userId);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/approve")
    @ApiOperation({ summary: "Approve a booking request (Owner/Admin only)" })
    approve(@Req() req: any, @Param("id") id: string) {
        return this.bookings.approveBooking({ userId: req.user.userId, role: req.user.role }, id);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/reject")
    reject(@Req() req: any, @Param("id") id: string, @Body() body: { reason?: string }) {
        return this.bookings.rejectBooking({ userId: req.user.userId, role: req.user.role }, id, body.reason);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/check-in")
    checkIn(@Req() req: any, @Param("id") id: string) {
        return this.bookings.checkIn({ userId: req.user.userId, role: req.user.role }, id);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/check-out")
    checkOut(@Req() req: any, @Param("id") id: string) {
        return this.bookings.checkOut({ userId: req.user.userId, role: req.user.role }, id);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/complete")
    complete(@Req() req: any, @Param("id") id: string) {
        return this.bookings.complete({ userId: req.user.userId, role: req.user.role }, id);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id/request-deletion")
    requestDeletion(@Req() req: any, @Param("id") id: string, @Body() body: { reason: string }) {
        return this.bookings.requestDeletion({ userId: req.user.userId, role: req.user.role }, id, body.reason);
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
}
