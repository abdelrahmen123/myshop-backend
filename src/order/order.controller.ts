import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Order, Roles } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRequest } from '../user/user.types';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiResponse } from '../types/global.types';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public create(@Request() req: UserRequest): Promise<ApiResponse<Order>> {
    return this.orderService.create(req.user);
  }

  @Get()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public async findAllByAdmin(): Promise<ApiResponse<Order[]>> {
    return this.orderService.findAll();
  }

  @Get('user-orders')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public async findAllByUser(
    @Request() req: UserRequest,
  ): Promise<ApiResponse<Order[]>> {
    return this.orderService.findAll(req.user);
  }

  @Get('user-orders/:id')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findOneByUser(
    @Param('id') id: string,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<Order>> {
    return this.orderService.findOne(id, req.user);
  }

  @Get(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findOneByAdmin(@Param('id') id: string): Promise<ApiResponse<Order>> {
    return this.orderService.findOne(id);
  }

  @Delete('user-orders/:id')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public cancelOrder(
    @Param('id') id: string,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<void>> {
    return this.orderService.cancelOrder(id, req.user);
  }

  @Patch(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public confirmOrderDelivery(
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.orderService.confirmOrderDelivery(id);
  }
}
