import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, Role } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { LoggerService } from 'src/log/logger.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { decodeToken } from 'src/utils/jwt.util';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);

  @SkipThrottle({ default: false })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Ip() ip: string, @Query('role') role?: Role) {
    this.logger.log(`IP: ${ip} findAll`, UsersController.name);
    return this.usersService.findAll(role);
  }

  @Throttle({ minute: { ttl: 1000, limit: 1 } })
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    const user = decodeToken(token);
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    const token = authHeader?.split(' ')[1];
    const user = decodeToken(token);
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    const user = decodeToken(token);
    return this.usersService.remove(id, user);
  }
}
