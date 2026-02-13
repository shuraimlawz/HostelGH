import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { HostelsService } from "./hostels.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { UserRole } from "@prisma/client";
import { CreateHostelDto, UpdateHostelDto } from "./dto/create-hostel.dto";

import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";

@ApiTags("Hostels")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("hostels")
export class HostelsController {
    constructor(private hostels: HostelsService) { }

    @Roles(UserRole.OWNER)
    @Post()
    @ApiOperation({ summary: "Create a new hostel (Owner only)" })
    create(@Req() req: any, @Body() dto: CreateHostelDto) {
        return this.hostels.create(req.user.userId, dto);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Patch(":id")
    @ApiOperation({ summary: "Update hostel details (Owner/Admin only)" })
    update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateHostelDto) {
        return this.hostels.update({ userId: req.user.userId, role: req.user.role }, id, dto);
    }

    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @Delete(":id")
    delete(@Req() req: any, @Param("id") id: string) {
        return this.hostels.delete({ userId: req.user.userId, role: req.user.role }, id);
    }

    @Roles(UserRole.OWNER)
    @Get("my-hostels")
    @ApiOperation({ summary: "Get all hostels owned by the user" })
    getMyHostels(@Req() req: any) {
        return this.hostels.findMyHostels(req.user.userId);
    }

    @Public()
    @Get("public")
    @ApiOperation({ summary: "Public search for hostels" })
    publicSearch(
        @Query("city") city?: string,
        @Query("minPrice") minPrice?: string,
        @Query("maxPrice") maxPrice?: string,
        @Query("university") university?: string,
        @Query("amenities") amenities?: string | string[],
    ) {
        const amenitiesArr = typeof amenities === 'string' ? amenities.split(',') : amenities;
        return this.hostels.publicSearch({
            city,
            minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
            university,
            amenities: amenitiesArr,
        });
    }

    @Public()
    @Get("public/:id")
    @ApiOperation({ summary: "Public get hostel details" })
    getPublicById(@Param("id") id: string) {
        return this.hostels.getPublicById(id);
    }

    @Public()
    @Get("city-stats")
    @ApiOperation({ summary: "Get count of hostels per city" })
    getCityStats() {
        return this.hostels.getCityStats();
    }
}
