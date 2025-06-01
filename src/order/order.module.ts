import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [PrismaModule, CartModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
