/* eslint-disable @typescript-eslint/unbound-method */
import {
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SafeUserType } from 'src/auth/types/auth.types';
import { Review } from '@prisma/client';
import { Roles } from '@prisma/client';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let prisma: PrismaService;

  const createReviewDto: CreateReviewDto = {
    text: 'text',
  };

  const existingReview: Review = {
    ...createReviewDto,
    id: '1',
    userId: '1',
    productId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user: SafeUserType = {
    id: '1',
    name: 'name',
    email: 'email',
    role: 'USER',
    image: 'image',
    phone: 'phone',
    address: 'address',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedReview = {
    ...existingReview,
    text: 'new text',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: PrismaService,
          useValue: {
            review: {
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

    reviewService = module.get<ReviewService>(ReviewService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('reviewService should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(prisma).toBeDefined();
  });

  describe('create()', () => {
    it('should return created review', async () => {
      (prisma.review.create as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingReview),
      );

      const result = await reviewService.create(createReviewDto, '1', user);

      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          text: createReviewDto.text,
          productId: '1',
          userId: user.id,
        },
      });
      expect(prisma.review.findUnique).not.toHaveBeenCalled();

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('review created successfully');
      expect(result.data).toEqual(existingReview);
    });
  });

  describe('findOne()', () => {
    it("should throw notFoundException if review doesn't exist", async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(reviewService.findOne('1')).rejects.toThrow(
        new NotFoundException('Review not found'),
      );
    });

    it('should return review', async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingReview),
      );

      const result = await reviewService.findOne('1');

      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.review.findUnique).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Review fetched successfully');
      expect(result.data).toEqual(existingReview);
    });
  });

  describe('update()', () => {
    it("should throw notFoundException if review doesn't exist", async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(
        reviewService.update('1', createReviewDto, user),
      ).rejects.toThrow(new NotFoundException('Review not found'));
    });

    it("should throw unauthorizedException if user doesn't match review's user", async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...existingReview, userId: '2' }),
      );

      await expect(
        reviewService.update('1', createReviewDto, user),
      ).rejects.toThrow(
        new UnauthorizedException('You are not allowed to update this review'),
      );
    });

    it('should return updated review', async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingReview),
      );
      (prisma.review.update as jest.Mock) = jest.fn(() =>
        Promise.resolve(updatedReview),
      );

      const result = await reviewService.update('1', createReviewDto, user);

      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          text: createReviewDto.text,
        },
      });

      expect(prisma.review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.review.update).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Review updated successfully');
      expect(result.data).toEqual(updatedReview);
    });
  });

  describe('remove()', () => {
    it("should throw notFoundException if review doesn't exist", async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(null),
      );

      await expect(reviewService.remove('1', user)).rejects.toThrow(
        new NotFoundException('Review not found'),
      );
    });

    it("should throw unauthorizedException if user doesn't match review's user", async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...existingReview, userId: '2' }),
      );

      await expect(
        reviewService.update('1', createReviewDto, user),
      ).rejects.toThrow(
        new UnauthorizedException('You are not allowed to update this review'),
      );
    });

    it('should not throw unauthorizedException if user is admin', async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve({ ...existingReview, userId: '2' }),
      );

      await expect(
        reviewService.remove('1', { ...user, role: Roles.ADMIN }),
      ).resolves.not.toThrow();
    });

    it('should remove review', async () => {
      (prisma.review.findUnique as jest.Mock) = jest.fn(() =>
        Promise.resolve(existingReview),
      );
      (prisma.review.delete as jest.Mock) = jest.fn(() => Promise.resolve());

      const result = await reviewService.remove('1', user);

      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(prisma.review.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.review.delete).toHaveBeenCalledTimes(1);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Review deleted successfully');
      expect(result.data).toBeUndefined();
    });
  });
});
