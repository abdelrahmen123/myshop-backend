/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { SafeUserType } from 'src/auth/types/auth.types';
import { CartWithItems, UpdateCartType } from './cart.types';
import { UpdateCartDto } from './dto/update-cart.dto';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

  const cart: CartWithItems = {
    id: '1',
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [
      {
        id: '1',
        productId: '1',
        cartId: '1',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: '1',
          name: 'Product 1',
          price: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          quantity: 0,
          description: null,
          discountPercent: null,
          sold: 0,
          image: '',
          images: [],
          rating: null,
          ratingAverage: null,
          categoryId: '',
        },
      },
    ],
  };

  const carts: CartWithItems[] = [
    cart,
    {
      ...cart,
      id: '2',
    },
    {
      ...cart,
      id: '3',
    },
    {
      ...cart,
      id: '4',
    },
  ];

  const updateCartDto: UpdateCartDto = {
    type: UpdateCartType.DECREMENT,
    quantity: 1,
  };

  const user: SafeUserType = {
    name: 'name',
    id: '1',
    email: 'email@gmail.com',
    role: 'USER',
    image: null,
    phone: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const req: any = { user };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            findAll: jest.fn(() => Promise.resolve(carts)),
            findOne: jest.fn(() => Promise.resolve(cart)),
            addItemToCart: jest.fn(() => Promise.resolve(cart)),
            update: jest.fn(() => Promise.resolve(cart)),
          },
        },
      ],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('CartController should be defined', () => {
    expect(cartController).toBeDefined();
  });

  it('CartService should be defined', () => {
    expect(cartService).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all carts', async () => {
      const result = await cartController.findAll();

      expect(cartService.findAll).toHaveBeenCalled();
      expect(cartService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(carts);
    });
  });

  describe('findOneByUser()', () => {
    it('should return cart', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await cartController.findOneByUser(req);

      expect(cartService.findOne).toHaveBeenCalledWith(user.id);
      expect(cartService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(cart);
    });
  });

  describe('findOneByAdminAndEmployees()', () => {
    it('should return cart', async () => {
      const result = await cartController.findOneByAdminAndEmployees('1');

      expect(cartService.findOne).toHaveBeenCalledWith('1');
      expect(cartService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(cart);
    });
  });

  describe('addItemToCart()', () => {
    it('should add item and return cart', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await cartController.addItemToCart(req, {
        productId: '1',
        quantity: 1,
      });

      expect(cartService.addItemToCart).toHaveBeenCalledWith(
        { productId: '1', quantity: 1 },
        user.id,
      );
      expect(cartService.addItemToCart).toHaveBeenCalledTimes(1);

      expect(result).toEqual(cart);
    });
  });

  describe('update()', () => {
    it('should update cart', async () => {
      const result = await cartController.update(
        '1',
        updateCartDto,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req,
      );

      expect(cartService.update).toHaveBeenCalledWith('1', updateCartDto, user);
      expect(cartService.update).toHaveBeenCalledTimes(1);

      expect(result).toEqual(cart);
    });
  });
});
