import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@prisma/client';
import { RolesDecorator } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRequest } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUserDto: CreateUserDto,
  ) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string) {
    console.log(id);
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.ADMIN])
  public update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  public remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findProfile(@Request() req: UserRequest) {
    return this.userService.findOne(req.user.id);
  }

  @Patch()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public updateProfile(
    @Request() req: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public removeProfile(@Request() req: UserRequest) {
    return this.userService.remove(req.user.id);
  }
}
