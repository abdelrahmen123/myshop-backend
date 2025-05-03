import { Product } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

export enum SortTypeQuery {
  ASC = 'asc',
  DESC = 'desc',
}

export type FiltrationObject = {
  category?: {
    name?: {
      equals: string;
      mode?: 'insensitive' | 'default';
    };
  };
  price?: {
    gte?: number;
    lte?: number;
  };
};

export type GetAllProducts = {
  status: HttpStatus;
  message: string;
  isEmpty: boolean;
  length: number;
  data: Product[];
};
