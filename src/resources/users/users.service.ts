import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
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

  async findOne(id: string, user: User) {
    try {
      const findUser = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!findUser) {
        throw new BadRequestException('User not found');
      }
      if (findUser.id !== user.id) {
        throw new BadRequestException('Unauthorized access');
      }
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: findUser,
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

  async update(id: string, updateUserDto: Prisma.UserUpdateInput, user: User) {
    try {
      const findUser = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!findUser) {
        throw new BadRequestException('User not found');
      }
      if (findUser.id !== user.id) {
        throw new BadRequestException('Unauthorized access');
      }
      const updateUser = await this.databaseService.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: updateUser,
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

  async remove(id: string, user: User) {
    try {
      const findUser = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!findUser) {
        throw new BadRequestException('User not found');
      }
      if (findUser.id !== user.id) {
        throw new BadRequestException('Unauthorized access');
      }
      const deleteUser = await this.databaseService.user.delete({
        where: {
          id,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: deleteUser,
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
