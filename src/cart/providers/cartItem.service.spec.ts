/* eslint-disable @typescript-eslint/unbound-method */
import { CartItem } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CartItemService } from './cartItem.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartItemService', () => {
  let cartItemService: CartItemService;
  let prisma: PrismaService;

  const quantity: number = 1;

  const cartItem: CartItem = {
    id: '1',
    cartId: '1',
    productId: '1',
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const increasedQuantity: CartItem = {
    ...cartItem,
    quantity: cartItem.quantity + 1,
  };

  const decreasedQuantity: CartItem = {
    ...cartItem,
    quantity: cartItem.quantity - quantity,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemService,
        {
          provide: PrismaService,
          useValue: {
            cartItem: {
              create: jest.fn(() => Promise.resolve(cartItem)),
              update: jest.fn(),
              delete: jest.fn(() => Promise.resolve()),
            },
          },
        },
      ],
    }).compile();

    cartItemService = module.get<CartItemService>(CartItemService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('CartItemService should be defined', () => {
    expect(cartItemService).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('createCartItem()', () => {
    it('should create a cart item', async () => {
      const result = await cartItemService.createCartItem('1', '1', 1);

      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: '1',
          productId: '1',
          quantity: 1,
        },
      });
      expect(prisma.cartItem.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(cartItem);
    });
  });

  describe('increaseCartItemsQuantity()', () => {
    it("should increase cart item's quantity", async () => {
      (prisma.cartItem.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(increasedQuantity),
      );

      const result = await cartItemService.increaseCartItemsQuantity(
        cartItem,
        1,
      );

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + 1 },
      });
      expect(prisma.cartItem.update).toHaveBeenCalledTimes(1);

      expect(result.quantity).toBe(increasedQuantity.quantity);
    });
  });

  describe('decreaseCartItemsQuantity()', () => {
    it('should throw BadRequestException if quantity is invalid', async () => {
      await expect(
        cartItemService.decreaseCartItemsQuantity('1', [cartItem], -1),
      ).rejects.toThrow(
        new BadRequestException('Quantity must be a positive number'),
      );
    });

    it('should throw NotFoundException if cart item not found', async () => {
      await expect(
        cartItemService.decreaseCartItemsQuantity('1', [], 1),
      ).rejects.toThrow(new NotFoundException('Cart item not found'));
    });

    it("should remove item if quantity is greater than or equal to cart item's quantity", async () => {
      const result = await cartItemService.decreaseCartItemsQuantity(
        cartItem.id,
        [cartItem],
        cartItem.quantity + 1,
      );

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: cartItem.id },
      });
      expect(prisma.cartItem.delete).toHaveBeenCalledTimes(1);

      expect(result).toBeUndefined();
    });

    it("should decrease cart item's quantity", async () => {
      (prisma.cartItem.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(decreasedQuantity),
      );

      const result = await cartItemService.decreaseCartItemsQuantity(
        cartItem.id,
        [cartItem],
        quantity,
      );

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity - quantity },
      });
      expect(prisma.cartItem.update).toHaveBeenCalledTimes(1);

      expect(result.quantity).toBe(decreasedQuantity.quantity);
    });
  });

  describe('removeCartItem()', () => {
    it('should remove cart item', async () => {
      const result = await cartItemService.deleteCartItem(cartItem.id);

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: cartItem.id },
      });
      expect(prisma.cartItem.delete).toHaveBeenCalledTimes(1);

      expect(result).toBeUndefined();
    });
  });
});
