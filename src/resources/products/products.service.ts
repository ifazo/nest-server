import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    try {
      const product = await this.databaseService.product.create({
        data: createProductDto,
      });
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to create product',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(categoryId?: string) {
    try {
      const products = categoryId
        ? await this.databaseService.product.findMany({
            where: { categoryId },
          })
        : await this.databaseService.product.findMany();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Products retrieved successfully',
        data: products,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve products',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.databaseService.product.findUnique({
        where: { id },
      });
      if (!product) {
        throw new BadRequestException('Product not found');
      }
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve product',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    try {
      const product = await this.databaseService.product.update({
        where: { id },
        data: updateProductDto,
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to update product',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const product = await this.databaseService.product.delete({
        where: { id },
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: product,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to delete product',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
