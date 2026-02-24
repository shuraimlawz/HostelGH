import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { UploadService, MulterFile } from "./upload.service";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("single")
  @ApiOperation({ summary: "Upload a single file (KYC/document)" })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadSingle(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Post("image")
  @ApiOperation({ summary: "Upload a single image" })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Post("images")
  @ApiOperation({ summary: "Upload multiple images" })
  @UseInterceptors(FilesInterceptor("files", 10))
  @ApiConsumes("multipart/form-data")
  async uploadImages(@UploadedFiles() files: MulterFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }
    const urls = await this.uploadService.uploadMultiple(files);
    return { urls };
  }
}
