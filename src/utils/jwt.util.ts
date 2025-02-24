import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET_KEY,
  signOptions: { expiresIn: '24h' },
});

export function generateToken(user: User) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwtService.sign(payload);
}

export function verifyToken(token: string) {
  return jwtService.verify(token);
}

export function decodeToken(token: string) {
  return jwtService.decode(token);
}
