/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  const createProductDto: CreateProductDto = {
    name: 'test',
    description: 'test',
    price: 10,
    quantity: 10,
    image: '',
    categoryId: '',
  };

  const products = [
    { ...createProductDto, name: 'key', id: '1' },
    { ...createProductDto, id: '2' },
    { ...createProductDto, name: 'key', id: '3' },
    { ...createProductDto, id: '4' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn((dto: CreateProductDto) =>
              Promise.resolve({ ...dto, id: '1' }),
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            findAll: jest.fn((query: GetProductsDto) =>
              Promise.resolve(products),
            ),
            getCount: jest.fn(() => Promise.resolve(products.length)),
            search: jest.fn((keyword: string) =>
              Promise.resolve(
                products.filter((product) => product.name.includes(keyword)),
              ),
            ),
            getBestSellers: jest.fn(() => Promise.resolve(products)),
            findOne: jest.fn((id: string) =>
              Promise.resolve(products.find((product) => product.id === id)),
            ),
            update: jest.fn((id: string, dto: CreateProductDto) =>
              Promise.resolve({ ...dto, id }),
            ),
            remove: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('productController should be defined', () => {
    expect(productController).toBeDefined();
  });

  it('productService should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('create()', () => {
    it("should call productService's create method", async () => {
      await productController.create(createProductDto);
      expect(productService.create).toHaveBeenCalledWith(createProductDto);
      expect(productService.create).toHaveBeenCalledTimes(1);
    });

    it('should return created product', async () => {
      const result = await productController.create(createProductDto);
      expect(result).toMatchObject({ ...createProductDto, id: '1' });
    });
  });

  describe('findAll()', () => {
    it("should call productService's findAll method", async () => {
      await productController.findAll(new GetProductsDto());
      expect(productService.findAll).toHaveBeenCalledWith(new GetProductsDto());
      expect(productService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all products', async () => {
      const result = await productController.findAll(new GetProductsDto());
      expect(result).toEqual(products);
      expect(result).toHaveLength(4);
    });
  });

  describe('getCount()', () => {
    it('should call productService.getCount()', async () => {
      const result = await productController.getCount();
      expect(productService.getCount).toHaveBeenCalled();
      expect(productService.getCount).toHaveBeenCalledTimes(1);
      expect(result).toBe(4);
    });
  });

  describe('search()', () => {
    it('should call productService.search()', async () => {
      const result = await productController.search('key');

      expect(productService.search).toHaveBeenCalledWith('key');
      expect(productService.search).toHaveBeenCalledTimes(1);

      expect(result).toEqual(
        products.filter((product) => product.name.includes('key')),
      );
    });
  });

  describe('getBestSellers()', () => {
    it('should call productService.getBestSellers()', async () => {
      const result = await productController.getBestSellers();

      expect(productService.getBestSellers).toHaveBeenCalled();
      expect(productService.getBestSellers).toHaveBeenCalledTimes(1);

      expect(result).toEqual(products);
      expect(result).toHaveLength(4);
    });
  });

  describe('findOne()', () => {
    it('should call productService.findOne()', async () => {
      const result = await productController.findOne('1');

      expect(productService.findOne).toHaveBeenCalledWith('1');
      expect(productService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(products[0]);
    });
  });

  describe('update()', () => {
    const updatedProductDto: CreateProductDto = {
      ...createProductDto,
      name: 'new name',
    };
    it('should call productService.update()', async () => {
      const result = await productController.update('1', updatedProductDto);

      expect(productService.update).toHaveBeenCalledWith(
        '1',
        updatedProductDto,
      );
      expect(productService.update).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject({ ...updatedProductDto, id: '1' });
    });
  });

  describe('remove()', () => {
    it('should call productService.remove()', async () => {
      const result = await productController.remove('1');

      expect(productService.remove).toHaveBeenCalledWith('1');
      expect(productService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
