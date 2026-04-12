import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>();

    if (!request.user || typeof request.user !== 'object') {
      throw new UnauthorizedException('Usuario autenticado no disponible.');
    }

    return request.user as AuthenticatedUser;
  },
);
