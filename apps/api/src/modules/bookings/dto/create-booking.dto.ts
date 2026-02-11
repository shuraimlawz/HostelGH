import { IsArray, IsDateString, IsOptional, IsString, ValidateNested, IsInt, Min } from "class-validator";
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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingItemDto)
    items!: BookingItemDto[];
}
