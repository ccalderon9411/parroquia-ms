import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { getEnvFilePath, config, validationSchema } from './config';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { IdentityDocumentTypesModule } from './identity-document-types/identity-document-types.module';
import { ParishPriestsModule } from './parish-priests/parish-priests.module';
import { ParishesModule } from './parishes/parishes.module';
import { PersonsModule } from './persons/persons.module';
import { PrismaModule } from './prisma/prisma.module';
import { PriestsModule } from './priests/priests.module';
import { SacramentRecordsModule } from './sacrament-records/sacrament-records.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      ignoreEnvFile: process.env.NODE_ENV === 'production' || false,
      load: [config],
      isGlobal: true,
      validationSchema,
    }),
    AuthModule,
    TerminusModule,
    IdentityDocumentTypesModule,
    ParishPriestsModule,
    ParishesModule,
    PersonsModule,
    PrismaModule,
    PriestsModule,
    SacramentRecordsModule,
    UsersModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthService],
})
export class AppModule {}
