import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum BroadcastType {
  INFO = "info",
  WARNING = "warning",
  ALERT = "alert",
}

export enum BroadcastTarget {
  ALL = "all",
  TENANTS = "tenants",
  OWNERS = "owners",
}

export class BroadcastMessageDto {
  @ApiProperty({ example: "System Maintenance" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Scheduled downtime at midnight." })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: BroadcastType, example: BroadcastType.INFO })
  @IsEnum(BroadcastType)
  @IsNotEmpty()
  type: BroadcastType;

  @ApiProperty({ enum: BroadcastTarget, example: BroadcastTarget.ALL })
  @IsEnum(BroadcastTarget)
  @IsNotEmpty()
  target: BroadcastTarget;
}
