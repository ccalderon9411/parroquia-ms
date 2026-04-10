import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { AppConfiguration } from '../../types/configuration';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    const config = configService.get<AppConfiguration>('config');
    const refreshSecret =
      config?.auth?.jwt.refreshSecret ?? 'change-me-refresh-secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: JwtPayload): AuthenticatedUser {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return {
      userId: payload.sub,
      username: payload.username,
      personId: payload.personId,
      refreshToken: refreshToken ?? undefined,
    };
  }
}