import { IsEnum, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PayoutMethodType } from "@prisma/client";

export class CreateSettlementAccountDto {
  @ApiProperty({ example: "055XXXXXXX" })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ example: "MTN" })
  @IsString()
  @IsNotEmpty()
  bankCode!: string;

  @ApiProperty({ example: "MTN Mobile Money" })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @ApiProperty({ enum: PayoutMethodType })
  @IsEnum(PayoutMethodType)
  method!: PayoutMethodType;
}
