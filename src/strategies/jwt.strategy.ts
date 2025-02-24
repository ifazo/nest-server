import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: { id: string; email: string; role: string }) {
    const user = await this.databaseService.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new Error('Unauthorized');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
