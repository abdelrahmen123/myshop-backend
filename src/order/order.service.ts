import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SafeUserType } from '../auth/types/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus } from '@prisma/client';
import { CartWithItems } from '../cart/cart.types';
import { ApiResponse } from '../types/global.types';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(user: SafeUserType): Promise<ApiResponse<Order>> {
    const cart: CartWithItems | null = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalAmount: number = cart.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const newOrder: Order = await this.prisma.order.create({
      data: {
        userId: user.id,
        status: OrderStatus.PENDING,
        totalAmount,
        items: {
          create: cart.cartItems.map((item) => ({
            quantity: item.quantity,
            productId: item.product.id,
          })),
        },
      },
    });

    await this.prisma.cart.delete({
      where: { id: cart.id },
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Order created successfully',
      data: newOrder,
    };
  }

  public async findAll(user?: SafeUserType): Promise<ApiResponse<Order[]>> {
    if (user) {
      const orders = await this.prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Orders fetched successfully',
        data: orders,
      };
    } else {
      const orders = await this.prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Orders fetched successfully',
        data: orders,
      };
    }
  }

  public async findOne(
    id: string,
    user?: SafeUserType,
  ): Promise<ApiResponse<Order>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user && order.userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to view this order',
      );
    }

    return {
      status: HttpStatus.OK,
      message: 'Order fetched successfully',
      data: order,
    };
  }

  public async cancelOrder(
    id: string,
    user: SafeUserType,
  ): Promise<ApiResponse<void>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to cancel this order',
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    return {
      status: HttpStatus.OK,
      message: 'Order cancelled successfully',
      data: undefined,
    };
  }

  public async confirmOrderDelivery(id: string): Promise<ApiResponse<void>> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.DELIVERED },
    });

    return {
      status: HttpStatus.OK,
      message: 'Order delivered successfully',
      data: undefined,
    };
  }
}
