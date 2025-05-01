/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { ApiResponse } from 'src/types/global.types';
import { SafeUserType } from 'src/auth/types/auth.types';

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
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user already exists',
      };
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
          image: createUserDto.image || '',
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
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user not found',
      };
    }

    const { password, ...data } = user;

    return {
      status: HttpStatus.OK,
      message: 'user fetched successfully',
      data,
    };
  }

  public async update(id: string, updateUserDto: UpdateUserDto) {
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
        updatedData[key] = updateUserDto[key];
      }
    }

    if (Object.keys(updatedData).length === 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'no fields to update',
      };
    }

    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user not found',
      };
    }

    const newUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updatedData,
      },
    });

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
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'user not found',
      };
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'user deleted successfully',
    };
  }
}
