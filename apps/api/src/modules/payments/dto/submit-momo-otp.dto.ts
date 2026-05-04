import { IsNotEmpty, IsString } from "class-validator";

export class SubmitMoMoOtpDto {
  @IsNotEmpty()
  @IsString()
  reference: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
