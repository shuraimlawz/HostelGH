import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { RoomGender, HostelBookingStatus } from "@prisma/client";

export class CreateHostelDto {
  @ApiProperty({ example: "Sunny Side Hostel" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "A peaceful place near campus", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "123 Campus St" })
  @IsString()
  @IsNotEmpty()
  addressLine!: string;

  @ApiProperty({ example: "Accra" })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: "Greater Accra", required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: "GH", default: "GH" })
  @IsOptional()
  @IsString()
  country?: string = "GH";

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  featuredUntil?: Date;

  @ApiProperty({
    example: ["https://images.unsplash.com/photo-1596401057633-5310457b1d4f"],
  })
  @IsOptional()
  @IsString({ each: true })
  images?: string[] = [];

  @ApiProperty({ example: ["WiFi", "AC", "Laundry"] })
  @IsOptional()
  @IsString({ each: true })
  amenities?: string[] = [];

  @ApiProperty({ example: "KNUST" })
  @IsOptional()
  @IsString()
  university?: string;

  // Ghana-specific fields
  @ApiProperty({ example: "0534094403", required: false })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiProperty({ example: "10 minutes walk", required: false })
  @IsOptional()
  @IsString()
  distanceToCampus?: string;

  @ApiProperty({ example: ["water", "light", "gas"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilitiesIncluded?: string[];

  @ApiProperty({
    example: "OPEN",
    enum: HostelBookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(HostelBookingStatus)
  bookingStatus?: HostelBookingStatus;

  @ApiProperty({ example: "No pets allowed.", required: false })
  @IsOptional()
  @IsString()
  policiesText?: string;

  @ApiProperty({
    example: RoomGender.MIXED,
    enum: RoomGender,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomGender)
  genderCategory?: RoomGender;


}

export class UpdateHostelDto extends PartialType(CreateHostelDto) { }
