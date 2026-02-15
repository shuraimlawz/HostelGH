import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { RoomsService } from "./rooms.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CreateRoomDto, UpdateRoomDto } from "./dto/create-room.dto";
import { UploadService } from "../upload/upload.service";

import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";

@ApiTags("Rooms")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("rooms")
export class RoomsController {
    constructor(
        private rooms: RoomsService,
        private upload: UploadService,
    ) { }

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

    @Roles(UserRole.OWNER)
    @Post(":id/images")
    @ApiOperation({ summary: "Upload a room image (Owner only)" })
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
    async uploadRoomImage(
        @Req() req: any,
        @Param("id") roomId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const result = await this.upload.uploadImageWithMetadata(file, 'hostelgh/rooms');
        await this.rooms.addRoomImages(roomId, req.user.userId, [result.url]);

        return {
            url: result.url,
            publicId: result.publicId,
        };
    }

    @Roles(UserRole.OWNER)
    @Post(":id/images/multiple")
    @ApiOperation({ summary: "Upload multiple room images (Owner only)" })
    @UseInterceptors(FilesInterceptor('images', 10))
    @ApiConsumes('multipart/form-data')
    async uploadMultipleRoomImages(
        @Req() req: any,
        @Param("id") roomId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const results = await this.upload.uploadMultipleWithMetadata(files, 'hostelgh/rooms');
        const urls = results.map(r => r.url);
        await this.rooms.addRoomImages(roomId, req.user.userId, urls);

        return {
            images: results.map(r => ({
                url: r.url,
                publicId: r.publicId,
            })),
        };
    }

    @Roles(UserRole.OWNER)
    @Delete(":id/images")
    @ApiOperation({ summary: "Delete a room image (Owner only)" })
    async deleteRoomImage(
        @Req() req: any,
        @Param("id") roomId: string,
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
        await this.rooms.removeRoomImage(roomId, req.user.userId, imageUrl);

        return { message: 'Image deleted successfully' };
    }
}
