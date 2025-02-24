import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UserSchema } from 'src/schemas/user.schema';
import { comparePassword, hashPassword } from 'src/utils/bcrypt.utils';
import { generateToken } from 'src/utils/jwt.util';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async signIn(email: string, password: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const token = generateToken(user);
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'User signed in successfully',
        data: { token },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to sign in user',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signUp(createUser: Prisma.UserCreateInput) {
    try {
      const validateUser = UserSchema.safeParse(createUser);
      if (!validateUser.success) {
        throw new BadRequestException(validateUser.error);
      }
      const userExists = await this.databaseService.user.findUnique({
        where: { email: createUser.email },
      });
      if (userExists) {
        throw new UnauthorizedException('User already exists');
      }
      const hashedPassword = await hashPassword(createUser.password);
      const user = await this.databaseService.user.create({
        data: {
          ...createUser,
          password: hashedPassword,
        },
      });
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: 'Failed to create user',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
