import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import redis from 'src/config/redis.config';
import { DatabaseService } from 'src/database/database.service';
import { ProductSchema } from 'src/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    try {
      const validateProduct = ProductSchema.safeParse(createProductDto);
      if (!validateProduct.success) {
        throw new BadRequestException(validateProduct.error);
      }
      const product = await this.databaseService.product.create({
        data: createProductDto,
      });
      await redis.set(`product:${product.id}`, JSON.stringify(product), {
        EX: 600,
      });
      await redis.del('products');
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

  async findAll(
    categoryId?: string,
    search?: string,
    price?: string,
    rating?: string,
    take?: number,
    skip?: number,
  ) {
    try {
      const cacheKey = `products:${categoryId || 'all'}:${search || 'all'}:${
        price || 'all'
      }:${rating || 'all'}:${take || 'all'}:${skip || 'all'}`;
      const cachedProducts = await redis.get(cacheKey);
      if (cachedProducts) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Products retrieved from redis cache',
          data: JSON.parse(cachedProducts),
        };
      }

      const where: Prisma.ProductWhereInput = {};
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (price) where.price = { lte: parseFloat(price) };
      if (rating) where.rating = { gte: parseFloat(rating) };

      const products = await this.databaseService.product.findMany({
        where,
        take,
        skip,
      });
      await redis.set(cacheKey, JSON.stringify(products), {
        EX: 3600,
      });
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
      const cachedProduct = await redis.get(`product:${id}`);
      if (cachedProduct) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Product retrieved from redis cache',
          data: JSON.parse(cachedProduct),
        };
      }
      const product = await this.databaseService.product.findUnique({
        where: { id },
      });
      if (!product) {
        throw new BadRequestException('Product not found');
      }
      await redis.set(`product:${id}`, JSON.stringify(product), { EX: 600 });
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
      await redis.del(`product:${id}`);
      await redis.del('products:*');
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
      await redis.del(`product:${id}`);
      await redis.del('products:*');
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
