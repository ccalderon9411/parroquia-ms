import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from './identity-document-type.repository';
import { IdentityDocumentTypesController } from './identity-document-types.controller';
import { IdentityDocumentTypesService } from './identity-document-types.service';
import { PrismaIdentityDocumentTypeRepository } from './prisma-identity-document-type.repository';

@Module({
  imports: [PrismaModule],
  controllers: [IdentityDocumentTypesController],
  providers: [
    IdentityDocumentTypesService,
    PrismaIdentityDocumentTypeRepository,
    {
      provide: IDENTITY_DOCUMENT_TYPE_REPOSITORY,
      useExisting: PrismaIdentityDocumentTypeRepository,
    },
  ],
  exports: [IdentityDocumentTypesService, IDENTITY_DOCUMENT_TYPE_REPOSITORY],
})
export class IdentityDocumentTypesModule {}
