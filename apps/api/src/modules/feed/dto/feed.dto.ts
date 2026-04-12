import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'The content of the post' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'URLs of images attached to the post', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'ID of the hostel to attach', required: false })
  @IsOptional()
  @IsString()
  hostelId?: string;

  @ApiProperty({ description: 'ID of the room to attach', required: false })
  @IsOptional()
  @IsString()
  roomId?: string;
}

export class UpdatePostDto {
  @ApiProperty({ description: 'The content of the post', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'URLs of images attached to the post', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  content: string;
}
