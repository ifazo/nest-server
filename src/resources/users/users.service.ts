import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import redis from 'src/config/redis.config';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(role?: Role) {
    try {
      const cacheKey = role ? `users:role:${role}` : 'users:all';
      const cachedUsers = await redis.get(cacheKey);
      if (cachedUsers) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'Users retrieved successfully (from cache)',
          data: JSON.parse(cachedUsers),
        };
      }
      const users = role
        ? await this.databaseService.user.findMany({
            where: {
              role,
            },
          })
        : await this.databaseService.user.findMany();
      await redis.set(cacheKey, JSON.stringify(users), {
        EX: 3600,
      });
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
      const cacheUser = await redis.get(`user:${id}`);
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
      if (cacheUser) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'User retrieved successfully',
          data: JSON.parse(cacheUser),
        };
      }
      await redis.set(`user:${id}`, JSON.stringify(findUser), { EX: 600 });
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
      await redis.del(`user:${id}`);
      await redis.del('users:all');
      await redis.del(`users:role:${findUser.role}`);
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
      await redis.del(`user:${id}`);
      await redis.del('users:all');
      await redis.del(`users:role:${findUser.role}`);
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
