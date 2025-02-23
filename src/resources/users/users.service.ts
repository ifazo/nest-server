import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(role?: Role) {
    try {
      const users = role
        ? await this.databaseService.user.findMany({
            where: {
              role,
            },
          })
        : await this.databaseService.user.findMany();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: users,
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

  async findOne(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to retrieve user',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    try {
      const user = await this.databaseService.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to update user',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const user = await this.databaseService.user.delete({
        where: {
          id,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to delete user',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
