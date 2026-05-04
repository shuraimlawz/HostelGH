import { IsNotEmpty, IsPhoneNumber, IsString, IsEnum, IsBoolean, IsOptional } from "class-validator";

export enum MoMoProvider {
  MTN = "mtn",
  VODAFONE = "vodafone",
  AIRTELTIGO = "airteltigo"
}

export class InitiateMoMoPaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsPhoneNumber("GH")
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(MoMoProvider)
  provider: MoMoProvider;

  @IsOptional()
  @IsBoolean()
  saveWallet?: boolean;
}
