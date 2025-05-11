import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemToCartDto } from '../dto/add-item-to-cart.dto';
import { CartItem } from '@prisma/client';

@Injectable()
export class CartItemService {
  constructor(private readonly prisma: PrismaService) {}

  public async updateCartItems(
    cartId: string,
    items: AddItemToCartDto['items'],
  ): Promise<void> {
    const operations = items.map((item) =>
      this.prisma.cartItem.upsert({
        where: { productId: item.productId },
        update: { quantity: { increment: item.quantity } },
        create: { cartId, productId: item.productId, quantity: item.quantity },
      }),
    );
    await this.prisma.$transaction(operations);
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
