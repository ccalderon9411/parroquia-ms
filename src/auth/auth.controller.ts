import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuario y emitir access y refresh token.' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Tokens emitidos correctamente.',
    type: AuthTokensDto,
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales invalidas.' })
  login(@Body() loginDto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token y refresh token.' })
  @ApiBearerAuth('refresh-token')
  @ApiOkResponse({
    description: 'Tokens renovados correctamente.',
    type: AuthTokensDto,
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalido.' })
  refreshTokens(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AuthTokensDto> {
    return this.authService.refreshTokens(currentUser);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión invalidando el refresh token.' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Sesión cerrada correctamente.' })
  async logout(@CurrentUser() currentUser: AuthenticatedUser): Promise<void> {
    await this.authService.logout(currentUser.userId);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: 'Obtener el usuario autenticado actual.' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Usuario autenticado.',
    type: AuthenticatedUserDto,
  })
  me(@CurrentUser() currentUser: AuthenticatedUser): AuthenticatedUserDto {
    return {
      userId: currentUser.userId,
      username: currentUser.username,
      personId: currentUser.personId,
    };
  }
}