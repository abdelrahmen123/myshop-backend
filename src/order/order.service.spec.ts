/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartWithItems } from 'src/cart/cart.types';
import { SafeUserType } from 'src/auth/types/auth.types';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';

describe('OrderService', () => {
  let orderService: OrderService;
  let prisma: PrismaService;

  const cart: CartWithItems = {
    id: '1',
    userId: '1',
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
      {
        id: '2',
        productId: '2',
        cartId: '1',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: '2',
          name: 'Product 2',
          price: 20,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const totalAmount: number = cart.cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const newOrder: Order = {
    id: '1',
    userId: '1',
    status: 'PENDING',
    totalAmount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orders = [
    { ...newOrder, id: '1' },
    { ...newOrder, id: '2', userId: '2' },
    { ...newOrder, id: '3', status: OrderStatus.DELIVERED },
    { ...newOrder, id: '4' },
    { ...newOrder, id: '5' },
  ];

  const user: SafeUserType = {
    id: '1',
    name: 'name',
    email: 'email',
    role: 'USER',
    image: 'image',
    phone: 'phone',
    address: 'address',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(() => Promise.resolve()),
            },
            order: {
              create: jest.fn(),
              findMany: jest.fn(() => Promise.resolve(orders)),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('orderService should be defined', () => {
    expect(orderService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('create()', () => {
    it('should throw NotFoundException if cart is not found', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );
      await expect(orderService.create(user)).rejects.toThrow(
        new NotFoundException('Cart not found'),
      );
    });

    it("should throw BadRequestException if cart doesn't have items", async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...cart, cartItems: [] }),
      );
      await expect(orderService.create(user)).rejects.toThrow(
        new BadRequestException('Cart is empty'),
      );
    });

    it('should call the prisma function (cart.findUnique, cart.delete, order.create)', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );
      (prisma.order.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(newOrder),
      );

      await orderService.create(user);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(prisma.cart.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          userId: '1',
          status: 'PENDING',
          totalAmount,
          items: {
            create: cart.cartItems.map((item) => ({
              quantity: item.quantity,
              productId: item.productId,
            })),
          },
        },
      });
      expect(prisma.order.create).toHaveBeenCalledTimes(1);

      expect(prisma.cart.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.cart.delete).toHaveBeenCalledTimes(1);
    });

    it('should create an order', async () => {
      (prisma.cart.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(cart),
      );
      (prisma.order.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(newOrder),
      );

      const result = await orderService.create(user);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Order created successfully');
      expect(result.data).toMatchObject(newOrder);
    });
  });

  describe('findAll()', () => {
    it('should return all orders if not user in params', async () => {
      const result = await orderService.findAll();

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Orders fetched successfully');
      expect(result.data).toEqual(orders);
      expect(result.data.length).toBe(5);
    });

    it("should return user's orders if user in params", async () => {
      const result = await orderService.findAll(user);

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Orders fetched successfully');
      expect(result.data).toEqual(orders);
      expect(result.data.length).toBe(5);
    });
  });

  describe('findOne()', () => {
    it("should throw NotFoundException if order doesn't exist", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(orderService.findOne('1', user)).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
    });

    it("should throw UnauthorizedException if order doesn't belong to user", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[1]),
      );

      await expect(orderService.findOne('2', user)).rejects.toThrow(
        new UnauthorizedException('You are not authorized to view this order'),
      );
    });

    it('should return order', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[0]),
      );

      const result = await orderService.findOne('1', user);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Order fetched successfully');
      expect(result.data).toEqual(orders[0]);
    });
  });

  describe('cancelOrder()', () => {
    it("should throw NotFoundException if order doesn't exist", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(orderService.cancelOrder('1', user)).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
    });

    it("should throw UnauthorizedException if order doesn't belong to user", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[1]),
      );

      await expect(orderService.cancelOrder('2', user)).rejects.toThrow(
        new UnauthorizedException(
          'You are not authorized to cancel this order',
        ),
      );
    });

    it('should throw BadRequestException if order is not pending', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[2]),
      );

      await expect(orderService.cancelOrder('3', user)).rejects.toThrow(
        new BadRequestException('Order is not pending'),
      );
    });

    it('should call prisma methods (update, findUnique)', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[0]),
      );
      (prisma.order.update as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...orders[0], status: OrderStatus.CANCELLED }),
      );

      await orderService.cancelOrder('1', user);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.order.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: OrderStatus.CANCELLED },
      });
      expect(prisma.order.update).toHaveBeenCalledTimes(1);
    });
    it('should cancel order', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[0]),
      );
      (prisma.order.update as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...orders[0], status: OrderStatus.CANCELLED }),
      );

      const result = await orderService.cancelOrder('1', user);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Order cancelled successfully');
    });
  });

  describe('confirmOrderDelivery()', () => {
    it("should throw NotFoundException if order doesn't exist", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(orderService.confirmOrderDelivery('1')).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
    });

    it('should throw BadRequestException if order is not pending', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[2]),
      );

      await expect(orderService.confirmOrderDelivery('3')).rejects.toThrow(
        new BadRequestException('Order is not pending'),
      );
    });

    it('should call prisma methods (update, findUnique)', async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[0]),
      );
      (prisma.order.update as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...orders[0], status: OrderStatus.DELIVERED }),
      );

      await orderService.confirmOrderDelivery('1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.order.findUnique).toHaveBeenCalledTimes(1);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: OrderStatus.DELIVERED },
      });
      expect(prisma.order.update).toHaveBeenCalledTimes(1);
    });

    it("should confirm order's delivery", async () => {
      (prisma.order.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(orders[0]),
      );
      (prisma.order.update as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...orders[0], status: OrderStatus.DELIVERED }),
      );

      const result = await orderService.confirmOrderDelivery('1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Order delivered successfully');
    });
  });
});
