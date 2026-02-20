import { IsEmail, MinLength, IsString } from "class-validator";

export class LoginDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
}

export class RefreshTokenDto {
  @IsString() userId!: string;
  @IsString() refreshToken!: string;
}
