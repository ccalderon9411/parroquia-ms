import { Module } from '@nestjs/common';
import { PersonsModule } from '../persons/persons.module';
import { PriestsModule } from '../priests/priests.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BaptismsController } from './controllers/baptisms.controller';
import { ConfirmationsController } from './controllers/confirmations.controller';
import { MarriagesController } from './controllers/marriages.controller';
import { SacramentRecordPrismaDataFactory } from './sacrament-record-prisma-data.factory';
import { PrismaSacramentRecordRepository } from './prisma-sacrament-record.repository';
import { SacramentBulkImportService } from './sacrament-bulk-import.service';
import { SacramentRecordSupportService } from './sacrament-record-support.service';
import { SACRAMENT_RECORD_REPOSITORY } from './sacrament-record.repository';
import { SacramentRecordsService } from './sacrament-records.service';
import { BaptismStrategy } from './strategies/baptism.strategy';
import { ConfirmationStrategy } from './strategies/confirmation.strategy';
import { MarriageStrategy } from './strategies/marriage.strategy';

@Module({
  imports: [PrismaModule, PersonsModule, PriestsModule],
  controllers: [
    BaptismsController,
    ConfirmationsController,
    MarriagesController,
  ],
  providers: [
    SacramentRecordsService,
    SacramentRecordSupportService,
    SacramentBulkImportService,
    SacramentRecordPrismaDataFactory,
    PrismaSacramentRecordRepository,
    BaptismStrategy,
    ConfirmationStrategy,
    MarriageStrategy,
    {
      provide: SACRAMENT_RECORD_REPOSITORY,
      useExisting: PrismaSacramentRecordRepository,
    },
  ],
  exports: [SacramentRecordsService, SACRAMENT_RECORD_REPOSITORY],
})
export class SacramentRecordsModule {}
