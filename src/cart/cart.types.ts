import { Cart, CartItem, Product, User } from '@prisma/client';

export enum UpdateCartType {
  DECREMENT = 'decrement',
  REMOVE = 'remove',
}

export type CartWithItems = Cart & {
  cartItems: (CartItem & {
    product: Product;
  })[];
};

export type CartWithUserAndItems = {
  user: User;
  cartItems: (CartItem & {
    product: Product;
  })[];
};

export type GetCartResponse = {
  status: number;
  message: string;
  totalPrice: number;
  data: CartWithUserAndItems;
};
