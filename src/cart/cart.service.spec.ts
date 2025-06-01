/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import { CartWithItems, UpdateCartType } from './cart.types';
import { CartItemService } from './providers/cartItem.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SafeUserType } from 'src/auth/types/auth.types';
import { UpdateCartDto } from './dto/update-cart.dto';

describe('CartService', () => {
  let cartService: CartService;
  let prisma: PrismaService;
  let cartItemService: CartItemService;

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

  const updateCartDtoDecrement: UpdateCartDto = {
    type: UpdateCartType.DECREMENT,
    quantity: 1,
  };
  const updateCartDtoRemove: UpdateCartDto = {
    type: UpdateCartType.REMOVE,
  };
  const updateCartDtoInvalidType: any = {
    type: 'invalid',
    quantity: 1,
  };
  const updateCartDtoInvalidQuantity: UpdateCartDto = {
    type: UpdateCartType.DECREMENT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findMany: jest.fn(() => Promise.resolve(carts)),
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: CartItemService,
          useValue: {
            increaseCartItemsQuantity: jest.fn(),
            decreaseCartItemsQuantity: jest.fn(),
            deleteCartItem: jest.fn(),
          },
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
    cartItemService = module.get<CartItemService>(CartItemService);
  });

  it('CartService should be defined', () => {
    expect(cartService).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('CartItemService should be defined', () => {
    expect(cartItemService).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all carts', async () => {
      const result = await cartService.findAll();

      expect(prisma.cart.findMany).toHaveBeenCalled();
      expect(prisma.cart.findMany).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Carts fetched successfully');
      expect(result.data).toEqual(carts);
    });
  });

  describe('findOne()', () => {
    it("should throw notFoundException if cart doesn't exist", async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(cartService.findOne('1')).rejects.toThrow(
        new NotFoundException('Cart not found'),
      );
    });

    it('should return cart', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );

      const result = await cartService.findOne('1');

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      expect(prisma.cart.findUnique).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Cart fetched successfully');
      expect(result.data).toEqual(cart);
    });
  });

  describe('addItemToCart()', () => {
    it("should throw notFoundException if product doesn't exist", async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        cartService.addItemToCart({ productId: '1', quantity: 1 }, '1'),
      ).rejects.toThrow(new NotFoundException('Product not found'));
    });

    it('should increase quantity of cart item is already exist', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0].product),
      );
      (prisma.cart.upsert as jest.Mock) = jest.fn(() => Promise.resolve(cart));
      (cartItemService.increaseCartItemsQuantity as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0]),
      );
      (cartService.findOne as jest.Mock) = jest.fn(() => Promise.resolve(cart));

      const result = await cartService.addItemToCart(
        { productId: '1', quantity: 1 },
        '1',
      );

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true },
      });

      expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.cart.upsert).toHaveBeenCalledWith({
        where: { userId: '1' },
        update: {},
        create: { userId: '1' },
        include: { cartItems: true },
      });

      expect(prisma.cart.upsert).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Item Added to Cart successfully');
      expect(result.data).toEqual(cart);
    });

    it('should add new cart item if cart item is not exist', async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0].product),
      );
      (prisma.cart.upsert as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...cart, cartItems: [] }),
      );
      (cartItemService.createCartItem as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0]),
      );
      (cartService.findOne as jest.Mock) = jest.fn(() => Promise.resolve(cart));

      const result = await cartService.addItemToCart(
        { productId: '1', quantity: 1 },
        '1',
      );

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true },
      });

      expect(prisma.product.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.cart.upsert).toHaveBeenCalledWith({
        where: { userId: '1' },
        update: {},
        create: { userId: '1' },
        include: { cartItems: true },
      });

      expect(prisma.cart.upsert).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Item Added to Cart successfully');
      expect(result.data).toEqual(cart);
    });
  });

  describe('update()', () => {
    it("should throw notFoundException if cart doesn't exist", async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        cartService.update('1', updateCartDtoDecrement, user),
      ).rejects.toThrow(new NotFoundException('Cart not found'));
    });

    it('should throw BadRequestException if type is invalid', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        cartService.update('1', updateCartDtoInvalidType, user),
      ).rejects.toThrow(new BadRequestException('Invalid update type'));
    });

    it('should throw BadRequestException if quantity is invalid', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );

      await expect(
        cartService.update('1', updateCartDtoInvalidQuantity, user),
      ).rejects.toThrow(new BadRequestException('Quantity is required'));
    });

    it('should decrease quantity of cart item if type is decrement', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );
      (cartItemService.decreaseCartItemsQuantity as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0]),
      );
      (cartService.findOne as jest.Mock) = jest.fn(() => Promise.resolve(cart));

      const result = await cartService.update(
        '1',
        updateCartDtoDecrement,
        user,
      );

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: { cartItems: true },
      });

      expect(prisma.cart.findUnique).toHaveBeenCalledTimes(1);

      expect(cartItemService.decreaseCartItemsQuantity).toHaveBeenCalledWith(
        '1',
        cart.cartItems,
        1,
      );

      expect(cartItemService.decreaseCartItemsQuantity).toHaveBeenCalledTimes(
        1,
      );
      expect(cartService.findOne).toHaveBeenCalledWith('1');
      expect(cartService.findOne).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Cart updated successfully');
      expect(result.data).toEqual(cart);
    });

    it('should remove item from cart if type is remove', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );
      (cartItemService.deleteCartItem as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart.cartItems[0]),
      );
      (cartService.findOne as jest.Mock) = jest.fn(() => Promise.resolve(cart));

      const result = await cartService.update('1', updateCartDtoRemove, user);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: { cartItems: true },
      });
      expect(prisma.cart.findUnique).toHaveBeenCalledTimes(1);

      expect(cartItemService.deleteCartItem).toHaveBeenCalledWith('1');
      expect(cartItemService.deleteCartItem).toHaveBeenCalledTimes(1);
      expect(cartService.findOne).toHaveBeenCalledWith('1');
      expect(cartService.findOne).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Cart updated successfully');
      expect(result.data).toEqual(cart);
    });
  });
});
