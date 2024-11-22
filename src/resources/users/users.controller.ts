import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, Role } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { LoggerService } from 'src/logger/logger.service';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string, @Query('role') role?: Role) {
    this.logger.log(`IP: ${ip} findAll`, UsersController.name);
    return this.usersService.findAll(role);
  }

  @Throttle({ minute: { ttl: 1000, limit: 1 } })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
