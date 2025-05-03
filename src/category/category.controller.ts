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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesDecorator } from 'src/auth/decorators/roles.decorator';
import { Category, Roles } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiResponse } from 'src/types/global.types';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  public findAll(): Promise<ApiResponse<Category[]>> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string): Promise<ApiResponse<Category>> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  public remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.categoryService.remove(id);
  }
}
