/* eslint-disable @typescript-eslint/unbound-method */
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterDto } from './dto/register.dto';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { saltOrRounds } from '../constants/hashing';
import { SafeUserType } from './types/auth.types';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const registerDto: RegisterDto = {
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'USER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('register()', () => {
    it("should call prisma's user's register method", async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );
      (prisma.user.create as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...registerDto, id: '1' }),
      );

      await authService.register({
        name: 'name',
        email: 'email',
        password: 'password',
        role: 'USER',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'email',
        },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...registerDto, id: '1' }),
      );

      await expect(
        authService.register({
          name: 'name',
          email: 'email',
          password: 'password',
          role: 'USER',
        }),
      ).rejects.toThrow(new BadRequestException('user already exists'));
    });

    it('should register a new user', async () => {
      const userWithoutPassword = {
        name: registerDto.name,
        email: registerDto.email,
        role: registerDto.role,
        id: '1',
      };

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );
      (prisma.user.create as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...registerDto, id: '1' }),
      );

      const result = await authService.register({
        name: 'name',
        email: 'email',
        password: 'password',
        role: 'USER',
      });

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('user has registered successfully');
      expect(result.data).toMatchObject(userWithoutPassword);
    });
  });

  describe('validate()', () => {
    it('findUnique() should be called', async () => {
      const user = { id: '1', ...registerDto };

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(user),
      );

      await authService.validate('email', 'password');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'email' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should return null if user doesn't exist", async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      const result = await authService.validate('email', 'password');

      expect(result).toBeNull();
    });

    it("should return null if password doesn't match", async () => {
      const user = { id: '1', ...registerDto };

      const hashedPassword = await bcrypt.hash('password', saltOrRounds);

      (prisma.user.findUnique as jest.Mock) = jest.fn(async () =>
        Promise.resolve({
          ...user,
          password: hashedPassword,
        }),
      );

      (bcrypt.compare as jest.Mock) = jest.fn(() => Promise.resolve(false));

      const result = await authService.validate('email', 'password');

      expect(result).toBeNull();
    });

    it('should return user if email and password match', async () => {
      const user = { id: '1', ...registerDto };
      const userWithoutPassword = {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user.id,
      };

      const hashedPassword = await bcrypt.hash('password', saltOrRounds);
      (prisma.user.findUnique as jest.Mock) = jest.fn(async () =>
        Promise.resolve({
          ...user,
          password: hashedPassword,
        }),
      );

      (bcrypt.compare as jest.Mock) = jest.fn(() => Promise.resolve(true));

      const result = await authService.validate('email', 'password');

      expect(result).toMatchObject(userWithoutPassword);
    });
  });

  describe('login()', () => {
    it('should return token', async () => {
      const user = {
        ...registerDto,
        id: '1',
      };

      const userWithoutPassword: SafeUserType = {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user.id,
        image: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await authService.login(userWithoutPassword);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('user logged in successfully');
      expect(result.data.accessToken).toBe('token');
    });
  });
});
