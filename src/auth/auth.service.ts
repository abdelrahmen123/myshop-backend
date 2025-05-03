/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { saltOrRounds } from 'src/constants/hashing';
import { AuthApiResponse } from './types/auth.types';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/types/global.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async validate(email: string, password: string) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email },
    });

    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || '',
    );

    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  public async login(user: any): Promise<ApiResponse<{ accessToken: string }>> {
    return {
      status: HttpStatus.OK,
      message: 'user logged in successfully',
      data: {
        accessToken: this.jwtService.sign(user),
      },
    };
  }

  /**
   * Register a new user.
   *
   * @param registerDto The details of the user to register.
   *
   * @returns An ApiResponse with the status of the operation.
   * The data property of the ApiResponse will be an object with the user's details,
   * excluding the password and role.
   *
   * @throws {ApiResponse} If a user with the given email already exists,
   * the ApiResponse will have a status of 400, and the message property will
   * be "user already exists".
   */
  public async register(registerDto: RegisterDto): Promise<AuthApiResponse> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (user) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'user already exists',
      };
    }

    const hashedPassword: string = await bcrypt.hash(
      registerDto.password,
      saltOrRounds,
    );

    const newUser = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        image: registerDto.image || '',
        phone: registerDto.phone || '',
        address: registerDto.address || '',
      },
    });

    const { password, ...data } = newUser;

    return {
      status: HttpStatus.CREATED,
      message: 'user has registered successfully',
      data,
    };
  }
}
