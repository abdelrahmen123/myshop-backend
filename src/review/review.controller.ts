import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserRequest } from '../user/user.types';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Review, Roles } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../types/global.types';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':productId')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createReviewDto: CreateReviewDto,
    @Param('productId') productId: string,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<Review>> {
    return this.reviewService.create(createReviewDto, productId, req.user);
  }

  @Get(':id')
  public findOne(@Param('id') id: string): Promise<ApiResponse<Review>> {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator([Roles.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateReviewDto: CreateReviewDto,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<Review>> {
    return this.reviewService.update(id, updateReviewDto, req.user);
  }

  @Delete(':id')
  @RolesDecorator([Roles.USER, Roles.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  public remove(
    @Param('id') id: string,
    @Request() req: UserRequest,
  ): Promise<ApiResponse<void>> {
    return this.reviewService.remove(id, req.user);
  }
}
