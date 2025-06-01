import { UpdateCategoryDto } from './dto/update-category.dto';
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

type CategoryTestType = {
  id: string;
  name: string;
  image?: string;
};

type CreateCategoryTestType = Omit<CategoryTestType, 'id'>;

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  const category: CreateCategoryTestType = {
    name: 'Category',
  };

  const categories: CategoryTestType[] = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
    { id: '3', name: 'Category 3' },
  ];

  const updateCategoryDto: UpdateCategoryDto = {
    name: 'New Name',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            create: jest.fn((category: CategoryTestType) =>
              Promise.resolve(category),
            ),
            findAll: jest.fn(() => Promise.resolve(categories)),
            findOne: jest.fn(() => Promise.resolve(categories[0])),
            update: jest.fn(() =>
              Promise.resolve({
                ...categories[0],
                name: updateCategoryDto.name,
              }),
            ),
            remove: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('categoryController should be defined', () => {
    expect(categoryController).toBeDefined();
  });

  it('categoryService should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('create()', () => {
    it("should call categoryService's create method", async () => {
      await categoryController.create(category);
      expect(categoryService.create).toHaveBeenCalledWith(category);
      expect(categoryService.create).toHaveBeenCalledTimes(1);
    });

    it('should return created category', async () => {
      const result = await categoryController.create(category);

      expect(result).toEqual(category);
    });
  });

  describe('findAll()', () => {
    it("should call categoryService's findAll method", async () => {
      await categoryController.findAll();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(categoryService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all categories', async () => {
      const result = await categoryController.findAll();

      expect(result).toEqual(categories);
    });
  });

  describe('findOne()', () => {
    it("should call categoryService's findOne method", async () => {
      await categoryController.findOne('1');

      expect(categoryService.findOne).toHaveBeenCalledWith('1');
      expect(categoryService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return category', async () => {
      const result = await categoryController.findOne('1');

      expect(result).toEqual(categories[0]);
    });
  });

  describe('update()', () => {
    it("should call categoryService's update method", async () => {
      await categoryController.update('1', updateCategoryDto);

      expect(categoryService.update).toHaveBeenCalledWith(
        '1',
        updateCategoryDto,
      );
      expect(categoryService.update).toHaveBeenCalledTimes(1);
    });

    it('should return updated category', async () => {
      const result = await categoryController.update('1', updateCategoryDto);

      expect(result).toEqual({
        ...categories[0],
        name: updateCategoryDto.name,
      });
    });
  });

  describe('remove()', () => {
    it("should call categoryService's remove method", async () => {
      await categoryController.remove('1');

      expect(categoryService.remove).toHaveBeenCalledWith('1');
      expect(categoryService.remove).toHaveBeenCalledTimes(1);
    });

    it('should return removed category', async () => {
      const result = await categoryController.remove('1');

      expect(result).toBeUndefined();
    });
  });
});
