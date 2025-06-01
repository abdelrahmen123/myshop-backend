/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderStatus } from '@prisma/client';
import { SafeUserType } from 'src/auth/types/auth.types';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const newOrder: Order = {
    id: '1',
    userId: '1',
    status: 'PENDING',
    totalAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const orders: Order[] = [
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

  const req: any = { user };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(() => Promise.resolve(newOrder)),
            findAll: jest.fn(() => Promise.resolve(orders)),
            findOne: jest.fn(() => Promise.resolve(orders[0])),
            cancelOrder: jest.fn(() => Promise.resolve()),
            confirmOrderDelivery: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('orderController should be defined', () => {
    expect(orderController).toBeDefined();
  });

  it('orderService should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new order', async () => {
      const result = await orderController.create(req);

      expect(orderService.create).toHaveBeenCalledWith(user);
      expect(orderService.create).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(newOrder);
    });
  });

  describe('findAllByAdmin()', () => {
    it('should return all orders by admin', async () => {
      const result = await orderController.findAllByAdmin();

      expect(orderService.findAll).toHaveBeenCalledWith();
      expect(orderService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(orders);
    });
  });

  describe('findAllByUser()', () => {
    it('should return all orders by user have it', async () => {
      const result = await orderController.findAllByUser(req);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(orderService.findAll).toHaveBeenCalledWith(req.user);
      expect(orderService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(orders);
    });
  });

  describe('findOneByAdmin()', () => {
    it('should return one order by admin', async () => {
      const result = await orderController.findOneByAdmin('1');

      expect(orderService.findOne).toHaveBeenCalledWith('1');
      expect(orderService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(newOrder);
    });
  });

  describe('findOneByUser()', () => {
    it('should return one order by user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const result = await orderController.findOneByUser('1', req.user);

      expect(orderService.findOne).toHaveBeenCalled();
      expect(orderService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(orders[0]);
    });
  });

  describe('cancelOrder()', () => {
    it('should cancel one order', async () => {
      const result = await orderController.cancelOrder('1', req);

      expect(orderService.cancelOrder).toHaveBeenCalledWith('1', user);
      expect(orderService.cancelOrder).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('confirmOrderDelivery()', () => {
    it('should confirm one order', async () => {
      const result = await orderController.confirmOrderDelivery('1');

      expect(orderService.confirmOrderDelivery).toHaveBeenCalledWith('1');
      expect(orderService.confirmOrderDelivery).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
