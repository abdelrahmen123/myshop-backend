/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiResponse } from 'src/types/global.types';

type ProductTest = { id: string; name: string; price: number };

describe('ProductService', () => {
  let productService: ProductService;
  let prisma: PrismaService;

  const createProductDto: CreateProductDto = {
    name: 'product',
    description: 'description',
    price: 10,
    quantity: 10,
    image: 'image',
    categoryId: '',
  };

  let products: ProductTest[] = [];

  beforeEach(async () => {
    products = [
      {
        id: '1',
        name: 'product1',
        price: 10,
      },
      {
        id: '2',
        name: 'product2',
        price: 20,
      },
      {
        id: '3',
        name: 'product3',
        price: 30,
      },
      {
        id: '4',
        name: 'product4',
        price: 40,
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('productService should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('create()', () => {
    it('should be called create method', async () => {
      await productService.create(createProductDto);
      expect(prisma.product.create).toHaveBeenCalled();
      expect(prisma.product.create).toHaveBeenCalledTimes(1);
    });

    it('should be called findUnique method', async () => {
      await productService.create(createProductDto);
      expect(prisma.product.findUnique).toHaveBeenCalled();
      expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should create a new product if product not found', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      (prisma.product.create as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ...createProductDto,
          id: '1',
          sold: 0,
        }),
      );

      const result = await productService.create(createProductDto);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { name: createProductDto.name },
      });

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: { ...createProductDto, sold: 0 },
      });

      expect(result).toBeDefined();

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Product created successfully');
      expect(result.data.id).toBe('1');
      expect(result.data).toMatchObject(createProductDto);
    });

    it('should update product quantity if product found', async () => {
      const existingProduct = {
        ...createProductDto,
        id: '1',
        quantity: 5,
      };

      const updatedProduct = {
        ...existingProduct,
        quantity: existingProduct.quantity + createProductDto.quantity,
      };

      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingProduct),
      );

      (prisma.product.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(updatedProduct),
      );

      const result = await productService.create(createProductDto);

      expect(prisma.product.update).toHaveBeenCalledWith({
        data: {
          ...existingProduct,
          quantity: updatedProduct.quantity,
        },
        where: {
          id: '1',
        },
      });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Product quantity updated successfully');
      expect(result.data.quantity).toBe(15);
    });
  });

  describe('findOne()', () => {
    it('should be called findUnique method', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      try {
        await productService.findOne('1');
      } catch (error) {
        expect(prisma.product.findUnique).toHaveBeenCalled(); // التأكد من استدعاء findUnique
        expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(NotFoundException); // التأكد من رمي الاستثناء الصحيح
      }
    });

    it('should throw error if product not found', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(productService.findOne('1')).rejects.toThrow(
        new NotFoundException('Product not found'),
      );
    });

    it('should return product if product found', async () => {
      const product = {
        ...createProductDto,
        id: '1',
      };

      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(product),
      );

      const result = await productService.findOne('1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { category: true, reviews: true },
      });

      expect(result).toBeDefined();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Product fetched successfully');
      expect(result.data).toMatchObject(product);
    });
  });

  describe('findAll()', () => {
    it('should be called findMany method', async () => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products),
      );

      await productService.findAll({ page: 1, limit: 10 });
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 10,
        include: { reviews: true },
      });
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 2 products if category is provided', async () => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products.slice(0, 2)),
      );

      const result = await productService.findAll({
        page: 1,
        limit: 10,
        category: 'category1',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: {
              name: {
                equals: 'category1',
                mode: 'insensitive',
              },
            },
          },
        }),
      );

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Products fetched successfully');
      expect(result.data.length).toBe(2);
    });

    it('should filter products by price range', async () => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products.filter((p) => p.price >= 10 && p.price <= 30)),
      );

      const result = await productService.findAll({
        page: 1,
        limit: 10,
        minPrice: 10,
        maxPrice: 30,
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            price: {
              gte: 10,
              lte: 30,
            },
          },
        }),
      );

      expect(result.data.length).toBe(3);
    });

    it('should return all products if category is not provided', async () => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products),
      );

      const result = await productService.findAll({ page: 1, limit: 10 });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Products fetched successfully');
      expect(result.data.length).toBe(4);
    });

    it('should apply pagination (page = 3, limit = 5)', async () => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products),
      );

      await productService.findAll({ page: 3, limit: 5 });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'asc' },
        skip: 10,
        take: 5,
        include: { reviews: true },
      });
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBestSellers()', () => {
    beforeEach(() => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(products.slice(0, 3)),
      );
    });

    it('should findMany have been called with the correct arguments', async () => {
      await productService.getBestSellers();
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: [{ sold: 'desc' }, { rating: 'desc' }],
        take: 3,
        include: { reviews: true },
      });
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 3 products', async () => {
      const result = await productService.getBestSellers();
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Best products fetched successfully');
      expect(result.data.length).toBe(3);
    });
  });

  describe('update()', () => {
    const updatedProduct = {
      ...createProductDto,
      name: 'Updated Product',
      id: '1',
    };

    beforeEach(() => {
      (prisma.product.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(updatedProduct),
      );
    });

    it('should findUnique have been called with the correct arguments', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(products[0]),
      );

      await productService.update('1', createProductDto);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return updated product', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(products[0]),
      );

      const result = await productService.update('1', createProductDto);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...products[0],
          ...createProductDto,
        },
      });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Product updated successfully');
      expect(result.data).toMatchObject(updatedProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        productService.update('1', createProductDto),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });

  describe('remove()', () => {
    it('should findUnique have been called with the correct arguments', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(products[0]),
      );

      await productService.remove('1');
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if product is not found', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(productService.remove('1')).rejects.toThrow(
        new NotFoundException('Product not found'),
      );
    });

    it("should return 'Product deleted successfully'", async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(products[0]),
      );
      (prisma.product.delete as jest.Mock) = jest.fn(() => Promise.resolve());

      const result = await productService.remove('1');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.product.delete).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Product deleted successfully');
      expect(result.data).toBeUndefined();
    });
  });

  describe('getCount()', () => {
    beforeEach(() => {
      (prisma.product.count as jest.Mock) = jest.fn(() => Promise.resolve(4));
    });

    it('should findMany have been called with the correct arguments', async () => {
      await productService.getCount();
      expect(prisma.product.count).toHaveBeenCalledWith();
      expect(prisma.product.count).toHaveBeenCalledTimes(1);
    });

    it('should return 4', async () => {
      const result: ApiResponse<number> = await productService.getCount();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Product count fetched successfully');
      expect(result.data).toBe(4);
    });
  });

  describe('search()', () => {
    const keyword = 'product1';

    beforeEach(() => {
      (prisma.product.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve([products[0]]),
      );
    });

    it('should findMany have been called with the correct arguments', async () => {
      await productService.search('product1');
      expect(prisma.product.findMany).toHaveBeenCalledWith({
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
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return product', async () => {
      const result = await productService.search(keyword);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Products fetched successfully');
      expect(result.data).toEqual([products[0]]);
    });
  });
});
