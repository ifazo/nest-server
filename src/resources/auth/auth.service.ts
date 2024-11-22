import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async signIn(email: string): Promise<{ token: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    const token = this.generateJwt(payload);

    return { token };
  }

  private generateJwt(payload: object): string {
    const secret = process.env.JWT_SECRET || 'ifaz-nest-jwt-secret-key';
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }
}
