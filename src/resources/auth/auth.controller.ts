import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('sign-up')
  async signUp(@Body() createUser: Prisma.UserCreateInput) {
    return this.authService.signUp(createUser);
  }
}
