import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from 'src/types/global.types';
import { Product } from '@prisma/client';
import { RolesDecorator } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetProductsDto } from './dto/get-products.dto';
import { GetAllProducts } from './product.types';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.productService.create(createProductDto);
  }

  @Get()
  public findAll(
    @Query() query: GetProductsDto,
  ): Promise<ApiResponse<Product[]>> {
    return this.productService.findAll(query);
  }

  @Get('count')
  public getCount(): Promise<ApiResponse<number>> {
    return this.productService.getCount();
  }

  @Get('search')
  public search(@Query('keyword') keyword: string): Promise<GetAllProducts> {
    return this.productService.search(keyword);
  }

  @Get('bestSellers')
  public getBestSellers() {
    return this.productService.getBestSellers();
  }

  // @Post('addMany')
  // public async addMany(
  //   @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  //   createProductDto: CreateProductDto[],
  // ) {
  //   await Promise.all(
  //     createProductDto.map(async (product) => {
  //       await this.productService.create(product); // هنا يتم انتظار عملية create
  //     }),
  //   );
  // }

  @Get(':id')
  public findOne(@Param('id') id: string): Promise<ApiResponse<Product>> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.productService.remove(id);
  }
}
