import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRequest } from '../user/user.types';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { CartWithItems, GetCartResponse } from './cart.types';
import { ApiResponse } from '../types/global.types';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findAll(): Promise<ApiResponse<CartWithItems[]>> {
    return this.cartService.findAll();
  }

  @Get('user-cart')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findOneByUser(@Request() req: UserRequest): Promise<GetCartResponse> {
    return this.cartService.findOne(req.user.id);
  }

  @Get(':id')
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findOneByAdminAndEmployees(
    @Param('id') id: string,
  ): Promise<GetCartResponse> {
    return this.cartService.findOne(id);
  }

  @Post()
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public addItemToCart(
    @Request() req: UserRequest,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AddItemToCartDto,
  ): Promise<ApiResponse<GetCartResponse>> {
    return this.cartService.addItemToCart(body, req.user.id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public update(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<GetCartResponse>> {
    return this.cartService.update(id, updateCartDto, req.user);
  }
}
