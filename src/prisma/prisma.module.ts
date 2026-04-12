import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_URL } from './prisma.constants';
import type { AppConfiguration } from '../types/configuration';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: DATABASE_URL,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<AppConfiguration>('config');
        if (!config?.database) return '';
        const { user, password, host, port, name } = config.database;
        const encodedUser = encodeURIComponent(user);
        const encodedPassword = encodeURIComponent(password);
        return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${name}`;
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
