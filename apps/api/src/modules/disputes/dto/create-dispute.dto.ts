import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DisputeRaisedBy } from "@prisma/client";
// Lint check

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ enum: DisputeRaisedBy })
  @IsEnum(DisputeRaisedBy)
  raisedBy!: DisputeRaisedBy;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  details?: string;
}
