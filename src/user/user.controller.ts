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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@prisma/client';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRequest } from './user.types';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiResponse } from '../types/global.types';
import { SafeUserType } from '../auth/types/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUserDto: CreateUserDto,
  ): Promise<ApiResponse<SafeUserType>> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RolesDecorator([Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public findAll(): Promise<ApiResponse<SafeUserType[]>> {
    return this.userService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string): Promise<ApiResponse<SafeUserType>> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.ADMIN])
  public update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<SafeUserType>> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  public remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    return this.userService.remove(id);
  }
}

@ApiCookieAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public findProfile(
    @Request() req: UserRequest,
  ): Promise<ApiResponse<SafeUserType>> {
    return this.userService.findOne(req.user.id);
  }

  @Patch()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public updateProfile(
    @Request() req: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<SafeUserType>> {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Patch('avatar')
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, cb) => {
          const prefix: string = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${prefix}-${file.originalname}`);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiSecurity('bearer')
  public updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<SafeUserType>> {
    const imageUrl = `/uploads/users/${file.filename}`;
    return this.userService.update(req.user.id, { image: imageUrl });
  }

  @Delete()
  @RolesDecorator([Roles.ADMIN, Roles.USER, Roles.SUPPLIER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('bearer')
  public removeProfile(
    @Request() req: UserRequest,
  ): Promise<ApiResponse<void>> {
    return this.userService.remove(req.user.id);
  }
}
