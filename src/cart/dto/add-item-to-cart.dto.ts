import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class CartItem {
  @IsNotEmpty()
  @IsUUID('4', { message: 'Product id is not valid', each: true })
  productId: string;

  @IsNotEmpty({ each: true })
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  quantity: number;
}

export class AddItemToCartDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true }) // يقوم بالتحقق من عناصر المصفوفة
  @Type(() => CartItem)
  items: CartItem[];
}
