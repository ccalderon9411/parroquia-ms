import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfiguration } from '../types/configuration';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    return this.issueTokens(user.id, user.username, user.personId);
  }

  async refreshTokens(currentUser: AuthenticatedUser): Promise<AuthTokensDto> {
    if (!currentUser.refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user?.active || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token invalido.');
    }

    const isRefreshTokenValid = await compare(
      currentUser.refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token invalido.');
    }

    return this.issueTokens(user.id, user.username, user.personId);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private async validateUser(
    username: string,
    password: string,
  ) {
    const user = await this.getUserByUsername(username);

    if (!user?.active) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    return user;
  }

  private getUserByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  private async issueTokens(
    userId: string,
    username: string,
    personId: string,
  ): Promise<AuthTokensDto> {
    const config = this.configService.get<AppConfiguration>('config');
    const accessExpiresIn =
      config?.auth?.jwt.accessExpiresIn as SignOptions['expiresIn'];
    const refreshExpiresIn =
      config?.auth?.jwt.refreshExpiresIn as SignOptions['expiresIn'];
    const payload: JwtPayload = {
      sub: userId,
      username,
      personId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: config?.auth?.jwt.accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: config?.auth?.jwt.refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: await hash(refreshToken, 10),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async comparePassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    if (
      storedPassword.startsWith('$2a$') ||
      storedPassword.startsWith('$2b$') ||
      storedPassword.startsWith('$2y$')
    ) {
      return compare(plainPassword, storedPassword);
    }

    return plainPassword === storedPassword;
  }
}