import { IsEnum, IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";
import { PayoutMethodType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePayoutMethodDto {
    @ApiProperty({ enum: PayoutMethodType })
    @IsEnum(PayoutMethodType)
    type: PayoutMethodType;

    @ApiProperty({ example: "GCB" })
    @IsString()
    provider: string;

    @ApiProperty({ example: "013", required: false })
    @IsOptional()
    @IsString()
    bankCode?: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    @IsString()
    accountNumber: string;

    @ApiProperty({ example: "John Doe" })
    @IsNotEmpty()
    @IsString()
    accountName: string;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
