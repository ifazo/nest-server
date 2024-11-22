import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createReviewDto: Prisma.ReviewCreateInput,
    userId?: string,
    productId?: string,
  ) {
    if (!userId && !productId) {
      throw new BadRequestException('userId and productId are required');
    }
    return this.databaseService.review.create({
      data: {
        ...createReviewDto,
        user: { connect: { id: userId } },
        product: { connect: { id: productId } },
      },
    });
  }

  findAll(productId: string) {
    if (!productId) {
      throw new BadRequestException('productId is required');
    }
    return this.databaseService.review.findMany({
      where: {
        productId,
      },
    });
  }

  findOne(id: string) {
    return this.databaseService.review.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateReviewDto: Prisma.ReviewUpdateInput) {
    return this.databaseService.review.update({
      where: {
        id,
      },
      data: updateReviewDto,
    });
  }

  remove(id: string) {
    return this.databaseService.review.delete({
      where: {
        id,
      },
    });
  }
}
