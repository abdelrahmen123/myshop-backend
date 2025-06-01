import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class AddItemToCartDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'Product id is not valid', each: true })
  @ApiProperty()
  productId: string;

  @IsNotEmpty({ each: true })
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @ApiProperty()
  quantity: number;
}
