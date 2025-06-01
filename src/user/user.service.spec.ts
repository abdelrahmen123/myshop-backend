/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;

  const user: CreateUserDto = {
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'USER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('create()', () => {
    it('findUnique() should be called', async () => {
      await userService.create(user);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw badRequestException if user already exists', async () => {
      const existingUser = { id: '1', ...user };

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingUser),
      );

      await expect(userService.create(user)).rejects.toThrow(
        new BadRequestException('user already exists'),
      );
    });

    it('should return created user', async () => {
      const createdUser = { id: '1', ...user };
      (prisma.user.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(createdUser),
      );
      const result = await userService.create(user);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('user created successfully');
      expect(result.data).toMatchObject(createdUser);
    });
  });

  describe('findAll()', () => {
    it('findMany() should be called', async () => {
      await userService.findAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return all users', async () => {
      const users = [
        { id: '1', ...user },
        { id: '2', ...user },
        { id: '3', ...user },
      ];

      (prisma.user.findMany as jest.Mock) = jest.fn(() =>
        Promise.resolve(users),
      );

      const result = await userService.findAll();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('users fetched successfully');
      expect(result.data).toBe(users);
    });
  });

  describe('findOne()', () => {
    it('findUnique() should be called', async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ id: '1', ...user }),
      );

      await userService.findOne('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should throw notFoundException if user doesn't exist", async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(userService.findOne('1')).rejects.toThrow(
        new NotFoundException('user not found'),
      );
    });

    it('should return user without password', async () => {
      const existingUser = { id: '1', ...user };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = existingUser;

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingUser),
      );

      const result = await userService.findOne('1');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('user fetched successfully');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).toMatchObject(userWithoutPassword);
    });
  });

  describe('update()', () => {
    const id = '1';

    it('should throw BadRequestException if no fields to update', async () => {
      await expect(userService.update(id, {})).rejects.toThrow(
        new BadRequestException('No fields to update'),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        userService.update(id, { name: 'New Name' }),
      ).rejects.toThrow(new NotFoundException('user not found'));
    });

    it('should update user and return user without password', async () => {
      const existingUser = { id: '1', ...user };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = existingUser;

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingUser),
      );

      (prisma.user.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(userWithoutPassword),
      );

      const result = await userService.update(id, { name: 'New Name' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { name: 'New Name' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('user updated successfully');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).toMatchObject(userWithoutPassword);
    });
  });

  describe('remove()', () => {
    it('should throw BadRequestException if no fields to update', async () => {
      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(userService.remove('1')).rejects.toThrow(
        new NotFoundException('user not found'),
      );
    });

    it('should remove user and return message', async () => {
      const existingUser = { id: '1', ...user };

      (prisma.user.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingUser),
      );

      (prisma.user.delete as jest.Mock) = jest.fn(() => Promise.resolve());

      const result = await userService.remove('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('user deleted successfully');
      expect(result.data).toBeUndefined();
    });
  });
});
