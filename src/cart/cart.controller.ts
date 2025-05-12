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
import { RolesDecorator } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRequest } from 'src/user/user.types';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findAll() {
    return this.cartService.findAll();
  }

  @Get('user-cart')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findOneByUser(@Request() req: UserRequest) {
    return this.cartService.findOne(req.user.id);
  }

  @Get(':id')
  @RolesDecorator([Roles.ADMIN, Roles.EMPLOYEE])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findOneByAdminAndEmployees(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Post()
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public addItemToCart(
    @Request() req: UserRequest,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AddItemToCartDto,
  ) {
    return this.cartService.addItemToCart(body, req.user.id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public update(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
    @Request() req: UserRequest,
  ) {
    return this.cartService.update(id, updateCartDto, req.user);
  }
}
