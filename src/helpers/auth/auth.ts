import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class Auth {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(
    payload: object,
    secret: string,
    expiresIn: string = '1h',
  ): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  verifyToken(token: string, secret: string): object | null {
    try {
      const decoded = jwt.verify(token, secret);
      if (typeof decoded === 'string') {
        return { token: decoded };
      }
      return decoded;
    } catch (err) {
      console.error('Invalid token:', err.message);
      return null;
    }
  }

  checkUserRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }
}
