import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(20, { message: 'Name must be at most 20 characters long' })
  @ApiProperty()
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is not valid' })
  @ApiProperty()
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  @IsEnum(Roles, { message: 'Role must be a valid role' })
  @ApiProperty({
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles = Roles.USER;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MinLength(10, { message: 'Phone must be at least 10 characters long' })
  @MaxLength(15, { message: 'Phone must be at most 15 characters long' })
  @ApiProperty()
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MinLength(10, { message: 'Address must be at least 10 characters long' })
  @MaxLength(100, { message: 'Address must be at most 100 characters long' })
  @ApiProperty()
  address?: string;
}
