import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsEnum,
  IsArray,
  ArrayMinSize,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { RoomGender } from "@prisma/client";

export class CreateRoomDto {
  @ApiProperty({ example: "2-in-1 Deluxe" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Spacious with extra storage", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  totalUnits!: number;

  @ApiProperty({
    example: 150000,
    description: "Price in minor units (e.g. 1500.00 GH₵)",
  })
  @IsInt()
  @Min(1)
  pricePerTerm!: number;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    example: ["https://images.unsplash.com/photo-1596401057633-5310457b1d4f"],
  })
  @IsOptional()
  @IsString({ each: true })
  images?: string[] = [];

  // Ghana-specific fields
  @ApiProperty({ example: "2 in a room" })
  @IsString()
  @IsNotEmpty()
  roomConfiguration!: string;

  @ApiProperty({ example: "MIXED", enum: RoomGender })
  @IsEnum(RoomGender)
  gender!: RoomGender;

  @ApiProperty({ example: 10, description: "Total available slots" })
  @IsInt()
  @Min(1)
  totalSlots!: number;

  @ApiProperty({ example: 10, description: "Currently available slots" })
  @IsInt()
  @Min(0)
  availableSlots!: number;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  hasAC?: boolean = false;

  @ApiProperty({ example: ["water", "light", "gas"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilitiesIncluded?: string[];
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
