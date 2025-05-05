import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse } from 'src/types/global.types';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetProductsDto } from './dto/get-products.dto';
import { FiltrationObject, GetAllProducts } from './product.types';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product: Product | null = await this.prisma.product.findUnique({
      where: { name: createProductDto.name },
    });

    if (product) {
      const newProduct: Product = await this.prisma.product.update({
        data: {
          ...product,
          quantity: product.quantity + createProductDto.quantity,
        },
        where: {
          id: product.id,
        },
      });

      return {
        status: HttpStatus.OK,
        message: 'Product quantity updated successfully',
        data: newProduct,
      };
    }
    const newProduct: Product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        sold: 0,
      },
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Product created successfully',
      data: newProduct,
    };
  }

  public async findAll(query: GetProductsDto): Promise<GetAllProducts> {
    const {
      category,
      minPrice,
      maxPrice,
      order,
      page = 1,
      limit = 10,
    }: GetProductsDto = query;

    const where: FiltrationObject = {};

    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const products: Product[] = await this.prisma.product.findMany({
      where,
      orderBy: {
        createdAt: order || 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: HttpStatus.OK,
      isEmpty: products.length === 0,
      length: products.length,
      message: 'Products fetched successfully',
      data: products,
    };
  }

  public async findOne(id: string): Promise<ApiResponse<Product>> {
    const product: Product | null = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'Product fetched successfully',
      data: product,
    };
  }

  public async getBestSellers(): Promise<GetAllProducts> {
    const bestProducts: Product[] = await this.prisma.product.findMany({
      orderBy: [{ sold: 'desc' }, { rating: 'desc' }],
      take: 3,
    });

    return {
      status: HttpStatus.OK,
      isEmpty: bestProducts.length === 0,
      length: bestProducts.length,
      message: 'Best products fetched successfully',
      data: bestProducts,
    };
  }

  public async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product: Product | null = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedData: Product = {
      ...product,
      ...updateProductDto,
    };

    const updatedProduct: Product = await this.prisma.product.update({
      where: { id },
      data: updatedData,
    });

    return {
      status: HttpStatus.OK,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  public async remove(id: string): Promise<ApiResponse<void>> {
    const product: Product | null = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      status: HttpStatus.OK,
      message: 'Product deleted successfully',
    };
  }

  public async getCount(): Promise<ApiResponse<number>> {
    const productCount: number = await this.prisma.product.count();

    return {
      status: HttpStatus.OK,
      message: 'Product count fetched successfully',
      data: productCount,
    };
  }

  public async search(keyword: string): Promise<GetAllProducts> {
    const products: Product[] = await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      status: HttpStatus.OK,
      isEmpty: products.length === 0,
      length: products.length,
      message: 'Products fetched successfully',
      data: products,
    };
  }
}
