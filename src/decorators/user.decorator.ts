import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { decodeToken } from 'src/utils/jwt.util';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return null;
    }
    return decodeToken(token);
  },
);
