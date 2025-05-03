import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeUserType } from 'src/auth/types/auth.types';
import { Review } from '@prisma/client';
import { ApiResponse } from 'src/types/global.types';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    createReviewDto: CreateReviewDto,
    productId: string,
    user: SafeUserType,
  ) {
    const newReview: Review = await this.prisma.review.create({
      data: {
        text: createReviewDto.text,
        productId: productId,
        userId: user.id,
      },
    });

    return {
      status: HttpStatus.CREATED,
      message: 'review created successfully',
      data: newReview,
    };
  }

  public async findOne(id: string): Promise<ApiResponse<Review>> {
    const review: Review | null = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'Review fetched successfully',
      data: review,
    };
  }

  public async update(
    id: string,
    updateReviewDto: CreateReviewDto,
    user: SafeUserType,
  ): Promise<ApiResponse<Review>> {
    const review: Review | null = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!user.id || review.userId !== user.id) {
      throw new UnauthorizedException(
        'You are not allowed to update this review',
      );
    }

    const updatedReview: Review = await this.prisma.review.update({
      where: { id },
      data: {
        text: updateReviewDto.text,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'Review updated successfully',
      data: updatedReview,
    };
  }

  public async remove(
    id: string,
    user: SafeUserType,
  ): Promise<ApiResponse<void>> {
    const review: Review | null = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if ((!user.id || review.userId !== user.id) && user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not allowed to delete this review',
      );
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return {
      status: HttpStatus.OK,
      message: 'Review deleted successfully',
    };
  }
}
