import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
      const categories = await this.databaseService.category.findMany();
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
      const category = await this.databaseService.category.findUnique({
        where: { id },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
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
