import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import redis from 'src/config/redis.config';
import { DatabaseService } from 'src/database/database.service';
import { CategorySchema } from 'src/schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: Prisma.CategoryCreateInput) {
    try {
      const validateCategory = CategorySchema.safeParse(createCategoryDto);
      if (!validateCategory.success) {
        throw new BadRequestException(validateCategory.error);
      }
      const category = await this.databaseService.category.create({
        data: createCategoryDto,
      });
      await redis.set(`category:${category.id}`, JSON.stringify(category), {
        EX: 600,
      });
      await redis.del('categories');
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Category created successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to create category',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      const cachedCategories = await redis.get('categories');
      if (cachedCategories) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Categories retrieved from redis cache',
          data: JSON.parse(cachedCategories),
        };
      }
      const categories = await this.databaseService.category.findMany();
      await redis.set('categories', JSON.stringify(categories), { EX: 3600 });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve categories',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string) {
    try {
      const cacheCategory = await redis.get(`category:${id}`);
      if (cacheCategory) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Category retrieved from redis cache',
          data: JSON.parse(cacheCategory),
        };
      }
      const category = await this.databaseService.category.findUnique({
        where: { id },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
      await redis.set(`category:${id}`, JSON.stringify(category));
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve category',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput) {
    try {
      const category = await this.databaseService.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      await redis.del(`category:${id}`);
      await redis.del('categories');
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Category updated successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to update category',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const category = await this.databaseService.category.delete({
        where: { id },
      });
      await redis.del(`category:${id}`);
      await redis.del('categories');
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Category deleted successfully',
        data: category,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to delete category',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
