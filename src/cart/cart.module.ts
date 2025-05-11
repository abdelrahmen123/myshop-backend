import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItemService } from './providers/cartItem.service';
import { ProductService } from 'src/product/product.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartItemService, ProductService],
})
export class CartModule {}
