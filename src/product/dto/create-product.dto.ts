import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(20, { message: 'Name must be at most 20 characters long' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(200, {
    message: 'Description must be at most 200 characters long',
  })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  discountPercent?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number = 1;

  @IsString({ message: 'Image must be a string' })
  @IsUrl({}, { message: 'Image is not valid' })
  image: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  images?: string[];

  @IsString({ message: 'Category must be a string' })
  @IsUUID(4, { message: 'Category is not valid' })
  categoryId: string;
}
