import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItem } from '@prisma/client';

@Injectable()
export class CartItemService {
  constructor(private readonly prisma: PrismaService) {}

  public async createCartItem(
    cartId: string,
    productId: string,
    quantity: number,
  ) {
    const cartItem = await this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });

    return cartItem;
  }

  public async increaseCartItemsQuantity(
    existingCartItem: CartItem,
    quantity: number,
  ) {
    return await this.prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + quantity },
    });
  }

  public async decreaseCartItemsQuantity(
    id: string,
    cartItems: CartItem[],
    quantity: number,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const cartItem = cartItems.find((item) => item.id === id);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity >= cartItem.quantity) {
      return await this.prisma.cartItem.delete({
        where: { id },
      });
    } else {
      return await this.prisma.cartItem.update({
        where: { id },
        data: { quantity: cartItem.quantity - quantity },
      });
    }
  }

  public async deleteCartItem(id: string): Promise<CartItem> {
    return await this.prisma.cartItem.delete({
      where: { id },
    });
  }
}
