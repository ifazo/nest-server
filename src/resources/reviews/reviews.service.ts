import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createReviewDto: Prisma.ReviewCreateInput, userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    try {
      const review = await this.databaseService.review.create({
        data: {
          ...createReviewDto,
          user: { connect: { id: userId } },
        },
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
      const reviews = await this.databaseService.review.findMany({
        where: {
          productId,
        },
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
      const review = await this.databaseService.review.findUnique({
        where: {
          id,
        },
      });
      if (!review) {
        throw new BadRequestException('Review not found');
      }
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

  async update(id: string, updateReviewDto: Prisma.ReviewUpdateInput) {
    try {
      const review = await this.databaseService.review.update({
        where: {
          id,
        },
        data: updateReviewDto,
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        data: review,
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

  async remove(id: string) {
    try {
      const review = await this.databaseService.review.delete({
        where: {
          id,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        data: review,
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
