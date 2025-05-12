import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class AddItemToCartDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'Product id is not valid', each: true })
  productId: string;

  @IsNotEmpty({ each: true })
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  quantity: number;
}
