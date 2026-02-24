import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectBookingDto {
  @ApiProperty({
    example: 'The room type is no longer available for your requested dates.',
    description: 'Reason for rejecting the booking',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
