import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { HostelsService } from "./hostels.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { UserRole } from "@prisma/client";
import { CreateHostelDto, UpdateHostelDto } from "./dto/create-hostel.dto";
import { AddFacilityDto } from "./dto/add-facility.dto";
import { UploadService } from "../upload/upload.service";

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

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
    return this.hostels.create(req.user.id, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(":id")
  @ApiOperation({ summary: "Update hostel details (Owner/Admin only)" })
  update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateHostelDto,
  ) {
    return this.hostels.update(
      { id: req.user.id, role: req.user.role },
      id,
      dto,
    );
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(":id")
  delete(@Req() req: any, @Param("id") id: string) {
    return this.hostels.delete({ id: req.user.id, role: req.user.role }, id);
  }

  @Roles(UserRole.OWNER)
  @Get("my-hostels")
  @ApiOperation({ summary: "Get all hostels owned by the user" })
  getMyHostels(@Req() req: any) {
    return this.hostels.findMyHostels(req.user.id);
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
    @Query("universityAliases") universityAliases?: string,
    @Query("amenities") amenities?: string | string[],
    @Query("sort") sort?: string,
    @Query("gender") gender?: string,
    @Query("roomConfig") roomConfig?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
    @Query("query") query?: string,
  ) {
    const amenitiesArr =
      typeof amenities === "string" ? amenities.split(",") : amenities;
    // universityAliases is a comma-separated list of name variants (sent by the schools page)
    const aliasesArr = universityAliases
      ? universityAliases.split("|").map(a => a.trim()).filter(Boolean)
      : undefined;
    return this.hostels.publicSearch({
      city,
      region,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      university,
      universityAliases: aliasesArr,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      amenities: amenitiesArr,
      sort,
      gender,
      roomConfig,
      query,
    });
  }

  @Public()
  @Get("city-stats")
  @ApiOperation({ summary: "Get count of hostels per city" })
  getCityStats() {
    return this.hostels.getCityStats();
  }

  @Public()
  @Get("trending-locations")
  @ApiOperation({ summary: "Get real trending locations based on activity" })
  getTrending() {
    return this.hostels.getTrendingLocations();
  }

  @Public()
  @Get("public/:id")
  @ApiOperation({ summary: "Public get hostel details" })
  getPublicById(@Req() req: any, @Param("id") id: string) {
    return this.hostels.getPublicById(
      id,
      req.user ? { id: req.user.id, role: req.user.role } : undefined,
    );
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get(":id")
  @ApiOperation({ summary: "Get single hostel details (Owner/Admin only)" })
  getById(@Req() req: any, @Param("id") id: string) {
    return this.hostels.getById({ id: req.user.id, role: req.user.role }, id);
  }

  @Roles(UserRole.OWNER)
  @Get("owner/counts")
  @ApiOperation({ summary: "Get owner notification counts" })
  getOwnerCounts(@Req() req: any) {
    return this.hostels.getOwnerNotificationCounts(req.user.id);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post(":id/facilities")
  @ApiOperation({ summary: "Add a facility to a hostel (Owner/Admin only)" })
  addFacility(
    @Req() req: any,
    @Param("id") hostelId: string,
    @Body() dto: AddFacilityDto,
  ) {
    return this.hostels.addFacility(
      { id: req.user.id, role: req.user.role },
      hostelId,
      dto,
    );
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(":id/facilities/:facilityId")
  @ApiOperation({ summary: "Remove a facility from a hostel (Owner/Admin only)" })
  removeFacility(
    @Req() req: any,
    @Param("id") hostelId: string,
    @Param("facilityId") facilityId: string,
  ) {
    return this.hostels.removeFacility(
      { id: req.user.id, role: req.user.role },
      hostelId,
      facilityId,
    );
  }

  @Roles(UserRole.OWNER)
  @Post(":id/images")
  @ApiOperation({ summary: "Upload a single hostel image (Owner only)" })
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
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
      throw new BadRequestException("No file uploaded");
    }

    const result = await this.upload.uploadImageWithMetadata(
      file,
      "hostelgh/hostels",
    );
    await this.hostels.addHostelImages(hostelId, req.user.id, [result.url]);

    return {
      url: result.url,
      publicId: result.publicId,
    };
  }

  @Roles(UserRole.OWNER)
  @Post(":id/images/multiple")
  @ApiOperation({ summary: "Upload multiple hostel images (Owner only)" })
  @UseInterceptors(FilesInterceptor("images", 10))
  @ApiConsumes("multipart/form-data")
  async uploadMultipleHostelImages(
    @Req() req: any,
    @Param("id") hostelId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

    const results = await this.upload.uploadMultipleWithMetadata(
      files,
      "hostelgh/hostels",
    );
    const urls = results.map((r) => r.url);
    await this.hostels.addHostelImages(hostelId, req.user.id, urls);

    return {
      images: results.map((r) => ({
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
      throw new BadRequestException("Image URL is required");
    }

    // Delete from Cloudinary if publicId is provided
    if (publicId) {
      await this.upload.deleteImage(publicId);
    }

    // Remove from database
    await this.hostels.removeHostelImage(hostelId, req.user.id, imageUrl);

    return { message: "Image deleted successfully" };
  }
}
