import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveBookingDto {
  @ApiProperty({
    example: 'Booking approved. Payment is due within 24 hours.',
    required: false,
    description: 'Optional message to send to tenant',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
