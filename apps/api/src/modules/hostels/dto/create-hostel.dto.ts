import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateHostelDto {
    @ApiProperty({ example: "Sunny Side Hostel" })
    @IsString() @IsNotEmpty() name!: string;

    @ApiProperty({ example: "A peaceful place near campus", required: false })
    @IsOptional() @IsString() description?: string;

    @ApiProperty({ example: "123 Campus St" })
    @IsString() @IsNotEmpty() addressLine!: string;

    @ApiProperty({ example: "Accra" })
    @IsString() @IsNotEmpty() city!: string;

    @ApiProperty({ example: "Greater Accra", required: false })
    @IsOptional() @IsString() region?: string;

    @ApiProperty({ example: "GH", default: "GH" })
    @IsOptional() @IsString() country?: string = "GH";

    @ApiProperty({ example: false, default: false })
    @IsOptional() @IsBoolean() isPublished?: boolean = false;

    @ApiProperty({ example: ["https://images.unsplash.com/photo-1596401057633-5310457b1d4f"] })
    @IsOptional() @IsString({ each: true }) images?: string[] = [];

    @ApiProperty({ example: ["WiFi", "AC", "Laundry"] })
    @IsOptional() @IsString({ each: true }) amenities?: string[] = [];

    @ApiProperty({ example: "KNUST" })
    @IsOptional() @IsString() university?: string;
}

export class UpdateHostelDto extends PartialType(CreateHostelDto) { }
