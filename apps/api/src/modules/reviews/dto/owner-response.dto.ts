import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class OwnerResponseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}
