/* eslint-disable @typescript-eslint/unbound-method */
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from './category.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let prisma: PrismaService;

  const category: CreateCategoryDto = {
    name: 'Category',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('categoryService should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('create()', () => {
    it('findUnique() should be called', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await categoryService.create(category);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: category.name },
      });
      expect(prisma.category.create).toHaveBeenCalledTimes(1);
    });

    it('create() should be called', async () => {
      const createdCategory = { id: '1', ...category };

      (prisma.category.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(createdCategory),
      );

      await categoryService.create(category);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: category,
      });
      expect(prisma.category.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if category already exists', async () => {
      const existingCategory = { id: '1', ...category };

      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );

      await expect(categoryService.create(category)).rejects.toThrow(
        new BadRequestException('Category already exists'),
      );
    });

    it('should return created category', async () => {
      const createdCategory = { id: '1', ...category };

      (prisma.category.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(createdCategory),
      );

      const result = await categoryService.create(category);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Category created successfully');
      expect(result.data).toEqual(createdCategory);
    });
  });

  describe('findAll()', () => {
    it('findMany() should be called', async () => {
      await categoryService.findAll();

      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(prisma.category.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return all categories', async () => {
      const categories = [
        { id: '1', ...category },
        { id: '2', ...category },
        { id: '3', ...category },
      ];

      (prisma.category.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(categories),
      );

      const result = await categoryService.findAll();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Categories fetched successfully');
      expect(result.data).toBe(categories);
    });
  });

  describe('findOne()', () => {
    it('findUnique() should be called', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ id: '1', ...category }),
      );

      await categoryService.findOne('1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(prisma.category.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should throw notFoundException if category doesn't exist", async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(categoryService.findOne('1')).rejects.toThrow(
        new NotFoundException('Category not found'),
      );
    });

    it('should return category', async () => {
      const existingCategory = { id: '1', ...category };

      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );

      const result = await categoryService.findOne('1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Category fetched successfully');
      expect(result.data).toEqual(existingCategory);
    });
  });

  describe('update()', () => {
    const existingCategory = { id: '1', ...category };
    const updatedCategory = { id: '1', ...category, name: 'New Name' };

    it('findUnique() and update() should be called', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );
      (prisma.category.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(updatedCategory),
      );

      await categoryService.update('1', { name: 'New Name' });

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updatedCategory,
      });

      expect(prisma.category.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.category.update).toHaveBeenCalledTimes(1);
    });

    it("should throw notFoundException if category doesn't exist", async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        categoryService.update('1', { name: 'New Name' }),
      ).rejects.toThrow(new NotFoundException('Category not found'));
    });

    it('should return updated category', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );
      (prisma.category.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(updatedCategory),
      );

      const result = await categoryService.update('1', { name: 'New Name' });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Category updated successfully');
      expect(result.data).toEqual(updatedCategory);
    });
  });

  describe('remove()', () => {
    const existingCategory = { id: '1', ...category };

    it('findUnique() and delete() should be called', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );
      (prisma.category.delete as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );

      await categoryService.remove('1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(prisma.category.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.category.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw notFoundException if category doesn't exist", async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(categoryService.remove('1')).rejects.toThrow(
        new NotFoundException('Category not found'),
      );
    });

    it('should delete category', async () => {
      (prisma.category.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingCategory),
      );
      (prisma.category.delete as jest.Mock) = jest.fn(() => Promise.resolve());

      const result = await categoryService.remove('1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Category deleted successfully');
      expect(result.data).toBeUndefined();
    });
  });
});
