import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

class BookingItemDto {
  @IsString() roomId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class CreateBookingDto {
  @IsString() hostelId!: string;

  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;

  @IsOptional() @IsString() notes?: string;

  @IsOptional() @IsString() levelOfStudy?: string;
  @IsOptional() @IsString() guardianName?: string;
  @IsOptional() @IsString() guardianPhone?: string;
  @IsOptional() @IsString() admissionDocUrl?: string;
  @IsOptional() @IsString() passportPhotoUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items!: BookingItemDto[];
}
