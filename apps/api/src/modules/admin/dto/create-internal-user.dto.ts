import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInternalUserDto {
    @ApiProperty({ example: 'admin@hostelgh.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'strongPassword123' })
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}
