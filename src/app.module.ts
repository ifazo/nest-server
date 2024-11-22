import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './resources/products/products.module';
import { CategoriesModule } from './resources/categories/categories.module';
import { UsersModule } from './resources/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { Auth } from './helpers/auth/auth';
import { ReviewsModule } from './resources/reviews/reviews.module';
import { AuthModule } from './resources/auth/auth.module';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    UsersModule,
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        name: 'minute',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'hour',
        ttl: 3600000,
        limit: 100,
      },
    ]),
    LoggerModule,
    ReviewsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    Auth,
  ],
})
export class AppModule {}
