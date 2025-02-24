import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import redis from 'src/config/redis.config';
import { DatabaseService } from 'src/database/database.service';
import { ReviewSchema } from 'src/schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createReviewDto: Prisma.ReviewCreateInput) {
    try {
      const validateReview = ReviewSchema.safeParse(createReviewDto);
      if (!validateReview.success) {
        throw new BadRequestException(validateReview.error);
      }
      const review = await this.databaseService.review.create({
        data: createReviewDto,
      });
      await redis.set(`review:${review.id}`, JSON.stringify(review), {
        EX: 600,
      });
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Review created successfully',
        data: review,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to create review',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(productId: string) {
    if (!productId) {
      throw new BadRequestException('productId is required');
    }
    try {
      const cachedReviews = await redis.get(`product reviews:${productId}`);
      if (cachedReviews) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Reviews retrieved from redis cache',
          data: JSON.parse(cachedReviews),
        };
      }
      const reviews = await this.databaseService.review.findMany({
        where: {
          productId,
        },
      });
      await redis.set(`product reviews:${productId}`, JSON.stringify(reviews), {
        EX: 600,
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        data: reviews,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve reviews',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      const cachedReview = await redis.get(`review:${id}`);
      if (cachedReview) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Review retrieved from redis cache',
          data: JSON.parse(cachedReview),
        };
      }
      const review = await this.databaseService.review.findUnique({
        where: {
          id,
        },
      });
      if (!review) {
        throw new BadRequestException('Review not found');
      }
      await redis.set(`review:${id}`, JSON.stringify(review), { EX: 600 });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Review retrieved successfully',
        data: review,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve review',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: string,
    updateReviewDto: Prisma.ReviewUpdateInput,
    userId: string,
  ) {
    try {
      const review = await this.databaseService.review.findUnique({
        where: {
          id,
        },
      });
      if (!review) {
        throw new BadRequestException('Review not found');
      }
      if (review.userId !== userId) {
        throw new BadRequestException(
          'You are not authorized to delete this review',
        );
      }
      const updateReview = await this.databaseService.review.update({
        where: {
          id,
        },
        data: updateReviewDto,
      });
      await redis.del(`review:${id}`);
      await redis.del(`product reviews:${review.productId}`);
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        data: updateReview,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to update review',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
      const review = await this.databaseService.review.findUnique({
        where: {
          id,
        },
      });
      if (!review) {
        throw new BadRequestException('Review not found');
      }
      if (review.userId !== userId) {
        throw new BadRequestException(
          'You are not authorized to delete this review',
        );
      }
      const deleteReview = await this.databaseService.review.delete({
        where: {
          id,
        },
      });
      await redis.del(`review:${id}`);
      await redis.del(`product reviews:${review.productId}`);
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        data: deleteReview,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to delete review',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
