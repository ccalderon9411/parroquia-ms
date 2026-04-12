import { Module } from '@nestjs/common';
import { IdentityDocumentTypesModule } from '../identity-document-types/identity-document-types.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PERSON_REPOSITORY } from './person.repository';
import { PersonsController } from './persons.controller';
import { PrismaPersonRepository } from './prisma-person.repository';
import { PersonsService } from './persons.service';

@Module({
  imports: [PrismaModule, IdentityDocumentTypesModule],
  controllers: [PersonsController],
  providers: [
    PersonsService,
    PrismaPersonRepository,
    {
      provide: PERSON_REPOSITORY,
      useExisting: PrismaPersonRepository,
    },
  ],
  exports: [PersonsService, PERSON_REPOSITORY],
})
export class PersonsModule {}
