import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';
import { decodeToken } from 'src/utils/jwt.util';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Body()
    createReviewDto: Prisma.ReviewCreateInput,
  ) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  findAll(@Query('productId') productId: string) {
    return this.reviewsService.findAll(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: Prisma.ReviewUpdateInput,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    const user = decodeToken(token);
    return this.reviewsService.update(id, updateReviewDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    const user = decodeToken(token);
    return this.reviewsService.remove(id, user.id);
  }
}
