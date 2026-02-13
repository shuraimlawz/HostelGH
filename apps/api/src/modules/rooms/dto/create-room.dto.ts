import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateRoomDto {
    @ApiProperty({ example: "2-in-1 Deluxe" })
    @IsString() @IsNotEmpty() name!: string;

    @ApiProperty({ example: "Spacious with extra storage", required: false })
    @IsOptional() @IsString() description?: string;

    @ApiProperty({ example: 2 })
    @IsInt() @Min(1) capacity!: number;

    @ApiProperty({ example: 10 })
    @IsInt() @Min(1) totalUnits!: number;

    @ApiProperty({ example: 150000, description: "Price in minor units (e.g. 1500.00 GH₵)" })
    @IsInt() @Min(1) pricePerTerm!: number;

    @ApiProperty({ example: true, default: true })
    @IsOptional() @IsBoolean() isActive?: boolean = true;

    @ApiProperty({ example: ["https://images.unsplash.com/photo-1596401057633-5310457b1d4f"] })
    @IsOptional() @IsString({ each: true }) images?: string[] = [];
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) { }
