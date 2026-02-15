import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { HostelsService } from "./hostels.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { UserRole } from "@prisma/client";
import { CreateHostelDto, UpdateHostelDto } from "./dto/create-hostel.dto";
import { UploadService } from "../upload/upload.service";

import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";

@ApiTags("Hostels")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("hostels")
export class HostelsController {
    constructor(
        private hostels: HostelsService,
        private upload: UploadService,
    ) { }

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
        @Query("region") region?: string,
        @Query("minPrice") minPrice?: string,
        @Query("maxPrice") maxPrice?: string,
        @Query("university") university?: string,
        @Query("amenities") amenities?: string | string[],
        @Query("sort") sort?: string,
    ) {
        const amenitiesArr = typeof amenities === 'string' ? amenities.split(',') : amenities;
        return this.hostels.publicSearch({
            city,
            region,
            minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
            maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
            university,
            amenities: amenitiesArr,
            sort,
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

    @Roles(UserRole.OWNER)
    @Post(":id/images")
    @ApiOperation({ summary: "Upload a single hostel image (Owner only)" })
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadHostelImage(
        @Req() req: any,
        @Param("id") hostelId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const result = await this.upload.uploadImageWithMetadata(file, 'hostelgh/hostels');
        await this.hostels.addHostelImages(hostelId, req.user.userId, [result.url]);

        return {
            url: result.url,
            publicId: result.publicId,
        };
    }

    @Roles(UserRole.OWNER)
    @Post(":id/images/multiple")
    @ApiOperation({ summary: "Upload multiple hostel images (Owner only)" })
    @UseInterceptors(FilesInterceptor('images', 10))
    @ApiConsumes('multipart/form-data')
    async uploadMultipleHostelImages(
        @Req() req: any,
        @Param("id") hostelId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const results = await this.upload.uploadMultipleWithMetadata(files, 'hostelgh/hostels');
        const urls = results.map(r => r.url);
        await this.hostels.addHostelImages(hostelId, req.user.userId, urls);

        return {
            images: results.map(r => ({
                url: r.url,
                publicId: r.publicId,
            })),
        };
    }

    @Roles(UserRole.OWNER)
    @Delete(":id/images")
    @ApiOperation({ summary: "Delete a hostel image (Owner only)" })
    async deleteHostelImage(
        @Req() req: any,
        @Param("id") hostelId: string,
        @Body("imageUrl") imageUrl: string,
        @Body("publicId") publicId?: string,
    ) {
        if (!imageUrl) {
            throw new BadRequestException('Image URL is required');
        }

        // Delete from Cloudinary if publicId is provided
        if (publicId) {
            await this.upload.deleteImage(publicId);
        }

        // Remove from database
        await this.hostels.removeHostelImage(hostelId, req.user.userId, imageUrl);

        return { message: 'Image deleted successfully' };
    }
}
