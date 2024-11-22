import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [DatabaseModule],
})
export class ReviewsModule {}
