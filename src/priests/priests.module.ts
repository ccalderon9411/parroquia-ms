import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PRIEST_REPOSITORY } from './priest.repository';
import { PrismaPriestRepository } from './prisma-priest.repository';
import { PriestsController } from './priests.controller';
import { PriestsService } from './priests.service';

@Module({
  imports: [PrismaModule, PersonsModule],
  controllers: [PriestsController],
  providers: [
    PriestsService,
    PrismaPriestRepository,
    {
      provide: PRIEST_REPOSITORY,
      useExisting: PrismaPriestRepository,
    },
  ],
  exports: [PriestsService, PRIEST_REPOSITORY],
})
export class PriestsModule {}
