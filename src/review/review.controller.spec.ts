/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import { SafeUserType } from '../auth/types/auth.types';

describe('ReviewController', () => {
  let reviewController: ReviewController;
  let reviewService: ReviewService;

  const review: Review = {
    id: '1',
    text: 'text',
    userId: '1',
    productId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createReviewDto: CreateReviewDto = {
    text: 'text',
  };

  const productId: string = '1';

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

  const req: any = { user };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: {
            create: jest.fn(() => Promise.resolve(review)),
            findOne: jest.fn(() => Promise.resolve(review)),
            update: jest.fn(() => Promise.resolve(review)),
            remove: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    reviewController = module.get<ReviewController>(ReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('ReviewController should be defined', () => {
    expect(reviewController).toBeDefined();
  });

  it('ReviewService should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('create()', () => {
    it('should create a review', async () => {
      const result = await reviewController.create(
        createReviewDto,
        productId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req,
      );

      expect(reviewService.create).toHaveBeenCalledWith(
        createReviewDto,
        productId,
        user,
      );
      expect(reviewService.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(review);
    });
  });

  describe('findOne()', () => {
    it('should return a review', async () => {
      const result = await reviewController.findOne('1');

      expect(reviewService.findOne).toHaveBeenCalledWith('1');
      expect(reviewService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(review);
    });
  });

  describe('update()', () => {
    it('should update a review', async () => {
      const result = await reviewController.update(
        '1',
        createReviewDto,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req,
      );

      expect(reviewService.update).toHaveBeenCalledWith(
        '1',
        createReviewDto,
        user,
      );
      expect(reviewService.update).toHaveBeenCalledTimes(1);

      expect(result).toEqual(review);
    });
  });

  describe('remove()', () => {
    it('should remove a review', async () => {
      await reviewController.remove(
        '1', // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req,
      );

      expect(reviewService.remove).toHaveBeenCalledWith('1', user);
      expect(reviewService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
