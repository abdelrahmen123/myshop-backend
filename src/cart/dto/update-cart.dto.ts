import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { UpdateCartType } from '../cart.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsEnum(UpdateCartType)
  @ApiProperty({
    enum: UpdateCartType,
  })
  type: UpdateCartType;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  @ApiPropertyOptional()
  quantity?: number;
}
