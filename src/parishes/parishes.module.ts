import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PARISH_REPOSITORY } from './parish.repository';
import { ParishesController } from './parishes.controller';
import { PrismaParishRepository } from './prisma-parish.repository';
import { ParishesService } from './parishes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParishesController],
  providers: [
    ParishesService,
    PrismaParishRepository,
    {
      provide: PARISH_REPOSITORY,
      useExisting: PrismaParishRepository,
    },
  ],
  exports: [ParishesService, PARISH_REPOSITORY],
})
export class ParishesModule {}
