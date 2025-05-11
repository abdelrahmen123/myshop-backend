import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { UpdateCartType } from '../cart.types';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsEnum(UpdateCartType)
  type: UpdateCartType;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  quantity?: number;
}
