import { Body, Controller, Get, Post, Patch, Param, Query, UseGuards, UsePipes, ValidationPipe, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { BroadcastMessageDto } from "./dto/broadcast-message.dto";

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get("stats")
    @ApiOperation({ summary: "Get global system stats" })
    getStats() {
        return this.adminService.getStats();
    }

    @Get("activity")
    @ApiOperation({ summary: "Get recent system activity" })
    getActivity(
        @Query("page") page?: number,
        @Query("limit") limit?: number
    ) {
        return this.adminService.getActivity(page ? Number(page) : 1, limit ? Number(limit) : 10);
    }

    @Get("analytics")
    @ApiOperation({ summary: "Get analytics data for charts" })
    getAnalytics() {
        return this.adminService.getAnalytics();
    }

    @Get("alerts")
    @ApiOperation({ summary: "Get security alerts" })
    getSecurityAlerts() {
        return this.adminService.getSecurityAlerts();
    }

    @Get("users")
    @ApiOperation({ summary: "Get all platform users" })
    getUsers() {
        return this.adminService.getUsers();
    }

    @Patch("users/:userId/role")
    @ApiOperation({ summary: "Update user role" })
    updateUserRole(@Param("userId") userId: string, @Body("role") role: UserRole) {
        return this.adminService.updateUserRole(userId, role);
    }

    @Post("users")
    @ApiOperation({ summary: "Create an internal user (Admin/Support)" })
    createInternalUser(@Body() dto: CreateInternalUserDto) {
        return this.adminService.createInternalUser(dto);
    }

    @Post("broadcast")
    @ApiOperation({ summary: "Send a broadcast message to all users" })
    broadcastMessage(@Body() dto: BroadcastMessageDto) {
        return this.adminService.broadcastMessage(dto);
    }
}
