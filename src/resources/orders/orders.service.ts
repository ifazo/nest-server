import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    try {
      const orders = await this.databaseService.order.findMany();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve users',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string, user: User) {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id,
        },
      });
      if (!order) {
        throw new BadRequestException('Order not found');
      }
      if (order.userId !== user.id) {
        throw new BadRequestException('Unauthorized access');
      }
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve order',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
