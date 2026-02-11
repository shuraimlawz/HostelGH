import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CreateRoomDto, UpdateRoomDto } from "./dto/create-room.dto";

import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Rooms")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("rooms")
export class RoomsController {
    constructor(private rooms: RoomsService) { }

    @Roles(UserRole.OWNER)
    @Post(":hostelId")
    @ApiOperation({ summary: "Add a room type to a hostel (Owner only)" })
    create(@Req() req: any, @Param("hostelId") hostelId: string, @Body() dto: CreateRoomDto) {
        return this.rooms.create(req.user.userId, hostelId, dto);
    }

    @Get("hostel/:hostelId")
    @ApiOperation({ summary: "Get all active rooms for a hostel" })
    findByHostel(@Param("hostelId") hostelId: string) {
        return this.rooms.findByHostel(hostelId);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id")
    @ApiOperation({ summary: "Update room details (Owner/Admin only)" })
    update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateRoomDto) {
        return this.rooms.update({ userId: req.user.userId, role: req.user.role }, id, dto);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Delete(":id")
    delete(@Req() req: any, @Param("id") id: string) {
        return this.rooms.delete({ userId: req.user.userId, role: req.user.role }, id);
    }
}
