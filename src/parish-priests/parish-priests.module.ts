import { Module } from '@nestjs/common';
import { ParishesModule } from '../parishes/parishes.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PriestsModule } from '../priests/priests.module';
import { PARISH_PRIEST_REPOSITORY } from './parish-priest.repository';
import { ParishPriestsController } from './parish-priests.controller';
import { ParishPriestsService } from './parish-priests.service';
import { PrismaParishPriestRepository } from './prisma-parish-priest.repository';

@Module({
  imports: [PrismaModule, ParishesModule, PriestsModule],
  controllers: [ParishPriestsController],
  providers: [
    ParishPriestsService,
    PrismaParishPriestRepository,
    {
      provide: PARISH_PRIEST_REPOSITORY,
      useExisting: PrismaParishPriestRepository,
    },
  ],
  exports: [ParishPriestsService, PARISH_PRIEST_REPOSITORY],
})
export class ParishPriestsModule {}
