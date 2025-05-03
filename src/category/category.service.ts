import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';
import { ApiResponse } from 'src/types/global.types';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const category: Category | null = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (category) {
      throw new BadRequestException('Category already exists');
    }

    const newCategory: Category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Category created successfully',
      data: newCategory,
    };
  }

  public async findAll(): Promise<ApiResponse<Category[]>> {
    const categories: Category[] = await this.prisma.category.findMany();

    return {
      status: HttpStatus.OK,
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  public async findOne(id: string): Promise<ApiResponse<Category>> {
    const category: Category | null = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  public async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const category: Category | null = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedData: Category = {
      ...category,
      ...updateCategoryDto,
    };

    const updatedCategory: Category = await this.prisma.category.update({
      where: { id },
      data: updatedData,
    });

    return {
      status: HttpStatus.OK,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  public async remove(id: string): Promise<ApiResponse<void>> {
    const category: Category | null = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      status: HttpStatus.OK,
      message: 'Category deleted successfully',
    };
  }
}
