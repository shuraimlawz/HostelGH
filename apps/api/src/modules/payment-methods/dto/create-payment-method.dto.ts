import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum PaymentMethodType {
  MOMO = "MOMO",
  CARD = "CARD",
  BANK = "BANK",
}

export class CreatePaymentMethodDto {
  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  type: string;

  @ApiProperty({
    description: "MTN, VODAFONE, AIRTELTIGO, VISA, MASTERCARD, or BANK_NAME",
  })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({
    required: false,
    description: "MoMo number (without + prefix, e.g. 233...)",
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.type === "MOMO")
  @Matches(/^233[0-9]{9}$/, {
    message: "Phone number must be a valid Ghana format (233XXXXXXXXX)",
  })
  phone?: string;

  @ApiProperty({ required: false, description: "Last 4 digits for cards" })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.type === "CARD")
  @Matches(/^[0-9]{4}$/, { message: "Last 4 must be exactly 4 digits" })
  last4?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDefault?: boolean;
}
