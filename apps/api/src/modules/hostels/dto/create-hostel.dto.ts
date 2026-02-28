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
import { RoomGender, HostelBookingStatus, HostelListingFeeModel } from "@prisma/client";

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

  // Listing fee model configuration
  @ApiProperty({
    example: HostelListingFeeModel.STANDARD,
    enum: HostelListingFeeModel,
    description: "Fee model: STANDARD (per-booking), MONTHLY_LISTING (fixed fee), REVENUE_SHARE (%), or PER_ACCEPTANCE (fixed per booking)",
    required: false,
  })
  @IsOptional()
  @IsEnum(HostelListingFeeModel)
  listingFeeModel?: HostelListingFeeModel;

  @ApiProperty({
    example: 5000,
    description: "Monthly listing fee in pesewas (e.g., 5000 = 50 GHS) - required for MONTHLY_LISTING model",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyListingFee?: number;

  @ApiProperty({
    example: 7.5,
    description: "Revenue share percentage (e.g., 7.5 for 7.5%) - required for REVENUE_SHARE model",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenueSharePercentage?: number;

  @ApiProperty({
    example: 2000,
    description: "Fixed fee per accepted booking in pesewas (e.g., 2000 = 20 GHS) - required for PER_ACCEPTANCE model",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perAcceptanceFee?: number;
}

export class UpdateHostelDto extends PartialType(CreateHostelDto) { }
