import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
    constructor(private users: UsersService) { }

    @Get("me")
    @ApiOperation({ summary: "Get current user profile" })
    getMe(@Req() req: any) {
        return this.users.findById(req.user.userId);
    }

    @Patch("me")
    updateProfile(@Req() req: any, @Body() dto: any) {
        return this.users.updateProfile(req.user.userId, dto);
    }
}
