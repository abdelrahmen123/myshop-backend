import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cart, CartItem } from '@prisma/client';
import { CartItemService } from './providers/cartItem.service';
import { ProductService } from 'src/product/product.service';
import { UpdateCartType } from './cart.types';
import { SafeUserType } from 'src/auth/types/auth.types';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartItemService: CartItemService,
    private readonly productService: ProductService,
  ) {}

  public async findAll() {
    const carts = await this.prisma.cart.findMany({
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return {
      status: HttpStatus.OK,
      message: 'Carts fetched successfully',
      data: carts,
    };
  }

  public async findOne(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
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

    return {
      status: HttpStatus.OK,
      message: 'Cart fetched successfully',
      data: cart,
    };
  }

  public async addItemToCart(
    addItemToCartDto: AddItemToCartDto,
    userId: string,
  ) {
    // check if products exist

    const productsExist = await this.prisma.product.findUnique({
      where: { id: addItemToCartDto.productId },
      select: { id: true },
    });

    if (!productsExist) {
      throw new NotFoundException('Product not found');
    }

    // get or create cart
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { cartItems: true },
    });

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === addItemToCartDto.productId,
    );

    if (existingCartItem) {
      await this.cartItemService.increaseCartItemsQuantity(
        existingCartItem,
        addItemToCartDto.quantity,
      );
    } else {
      await this.cartItemService.createCartItem(
        cart.id,
        addItemToCartDto.productId,
        addItemToCartDto.quantity,
      );
    }

    const updatedCart = await this.findOne(userId);

    return {
      status: HttpStatus.OK,
      message: 'Item Added to Cart successfully',
      data: updatedCart,
    };
  }

  public async update(
    id: string,
    updateCartDto: UpdateCartDto,
    user: SafeUserType,
  ) {
    const cart: (Cart & { cartItems: CartItem[] }) | null =
      await this.prisma.cart.findUnique({
        where: { userId: user.id },
        include: { cartItems: true },
      });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    switch (updateCartDto.type) {
      case UpdateCartType.DECREMENT:
        if (!updateCartDto.quantity) {
          throw new BadRequestException('Quantity is required');
        }

        await this.cartItemService.decreaseCartItemsQuantity(
          id,
          cart.cartItems,
          updateCartDto.quantity,
        );
        break;
      case UpdateCartType.REMOVE:
        await this.cartItemService.deleteCartItem(id);
        break;

      default:
        throw new BadRequestException('Invalid update type');
    }

    const updatedCart = await this.findOne(user.id);

    return {
      status: HttpStatus.OK,
      message: 'Cart updated successfully',
      data: updatedCart,
    };
  }
}
