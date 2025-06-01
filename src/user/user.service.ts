import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { ApiResponse } from '../types/global.types';
import { SafeUserType } from '../auth/types/auth.types';
import path from 'node:path';
import fs from 'node:fs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    createUserDto: CreateUserDto,
  ): Promise<ApiResponse<SafeUserType>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (user) {
      throw new BadRequestException('user already exists');
    }

    return {
      status: HttpStatus.CREATED,
      message: 'user created successfully',
      data: await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: createUserDto.password,
          role: createUserDto.role,
          phone: createUserDto.phone || '',
          address: createUserDto.address || '',
        },
      }),
    };
  }

  public async findAll(): Promise<ApiResponse<SafeUserType[]>> {
    return {
      status: HttpStatus.OK,
      message: 'users fetched successfully',
      data: await this.prisma.user.findMany(),
    };
  }

  public async findOne(id: string): Promise<ApiResponse<SafeUserType>> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = user;

    return {
      status: HttpStatus.OK,
      message: 'user fetched successfully',
      data,
    };
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<SafeUserType>> {
    const updatedData: Record<string, string> = {};

    const allowedFields = [
      'name',
      'email',
      'image',
      'role',
      'phone',
      'address',
    ];

    for (const key of allowedFields) {
      if (updateUserDto[key]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updatedData[key] = updateUserDto[key];
      }
    }

    if (Object.keys(updatedData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (updateUserDto.image && user.image) {
      const oldImagePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads/users',
        path.basename(user.image),
      );

      try {
        // تحقق من وجود الصورة القديمة باستخدام fs.promises
        await fs.promises.access(oldImagePath, fs.constants.F_OK);

        // حذف الصورة القديمة
        await fs.promises.unlink(oldImagePath);
        console.log('Old image deleted successfully');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.log('Old image does not exist, skipping deletion');
      }
    }

    const newUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updatedData,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = newUser;

    return {
      status: HttpStatus.OK,
      message: 'user updated successfully',
      data,
    };
  }

  public async remove(id: string): Promise<ApiResponse<void>> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'user deleted successfully',
      data: undefined,
    };
  }
}
