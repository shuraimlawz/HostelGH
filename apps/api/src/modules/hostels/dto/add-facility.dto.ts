import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FacilityType } from "@prisma/client";

export class AddFacilityDto {
    @ApiProperty({ example: "Air Conditioning" })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: FacilityType.FREE, enum: FacilityType })
    @IsEnum(FacilityType)
    @IsNotEmpty()
    type!: FacilityType;
}
