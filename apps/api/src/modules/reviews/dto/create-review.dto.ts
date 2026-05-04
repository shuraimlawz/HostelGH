import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, Max, IsArray, IsUrl } from "class-validator";

export class CreateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  cleanliness?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  comfort?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  staff?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];
}
