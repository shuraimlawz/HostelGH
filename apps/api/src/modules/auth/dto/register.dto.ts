import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsArray,
  ValidateNested,
} from "class-validator";
import { UserRole, UserGender } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!", minLength: 8 })
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TENANT })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ example: "John", required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: "Doe", required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: "0541234567", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserGender, example: UserGender.MALE, required: false })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
