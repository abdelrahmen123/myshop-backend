import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The name of the product (optional)',
  })
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Description of the product (optional)',
  })
  description?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Price of the product (optional)',
  })
  price?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Discount percent of the product (optional)',
  })
  discountPercent?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Quantity of the product (optional)',
  })
  quantity?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Image URL of the product (optional)',
  })
  image?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Additional images of the product (optional)',
  })
  images?: string[];

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Category ID of the product (optional)',
  })
  categoryId?: string;
}
