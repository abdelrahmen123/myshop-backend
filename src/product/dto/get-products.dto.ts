import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { SortTypeQuery } from '../product.types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The category of the product to filter',
    required: false,
  })
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({
    description: 'The minimum price of the product to filter',
    required: false,
  })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({
    description: 'The maximum price of the product to filter',
    required: false,
  })
  maxPrice?: number;

  @IsOptional()
  @IsIn([SortTypeQuery.ASC, SortTypeQuery.DESC])
  @ApiPropertyOptional({
    description: 'The order of the products',
    required: false,
    enum: [SortTypeQuery.ASC, SortTypeQuery.DESC],
  })
  order?: SortTypeQuery;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    description: 'The page number of the products',
    required: false,
    default: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    description: 'The limit of the products',
    required: false,
    default: 10,
  })
  limit?: number = 10;
}
