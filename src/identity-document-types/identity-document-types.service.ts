import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdentityDocumentType, Prisma } from '../prisma/generated/client';
import { IDENTITY_DOCUMENT_TYPE_REPOSITORY } from './identity-document-type.repository';
import type { IdentityDocumentTypeRepository } from './identity-document-type.repository';

@Injectable()
export class IdentityDocumentTypesService {
  constructor(
    @Inject(IDENTITY_DOCUMENT_TYPE_REPOSITORY)
    private readonly identityDocumentTypesRepository: IdentityDocumentTypeRepository,
  ) {}

  findAll(activeOnly?: boolean): Promise<IdentityDocumentType[]> {
    return this.identityDocumentTypesRepository.findAll(activeOnly);
  }

  findById(id: bigint): Promise<IdentityDocumentType | null> {
    return this.identityDocumentTypesRepository.findById(id);
  }

  async findByIdOrFail(id: bigint): Promise<IdentityDocumentType> {
    const identityDocumentType = await this.findById(id);

    if (!identityDocumentType) {
      throw new NotFoundException('Tipo de documento no encontrado.');
    }

    return identityDocumentType;
  }

  findByAbbreviation(
    abbreviation: string,
  ): Promise<IdentityDocumentType | null> {
    return this.identityDocumentTypesRepository.findByAbbreviation(abbreviation);
  }

  async create(
    data: Prisma.IdentityDocumentTypeCreateInput,
  ): Promise<IdentityDocumentType> {
    const existing = await this.findByAbbreviation(data.abbreviation);

    if (existing) {
      throw new ConflictException('La abreviatura ya existe.');
    }

    return this.identityDocumentTypesRepository.create(data);
  }

  async update(
    id: bigint,
    data: Prisma.IdentityDocumentTypeUpdateInput,
  ): Promise<IdentityDocumentType> {
    const current = await this.findByIdOrFail(id);

    if (
      typeof data.abbreviation === 'string' &&
      data.abbreviation !== current.abbreviation
    ) {
      const existing = await this.findByAbbreviation(data.abbreviation);

      if (existing) {
        throw new ConflictException('La abreviatura ya existe.');
      }
    }

    return this.identityDocumentTypesRepository.update(id, data);
  }

  async delete(id: bigint): Promise<IdentityDocumentType> {
    await this.findByIdOrFail(id);
    return this.identityDocumentTypesRepository.delete(id);
  }

  async setActive(
    id: bigint,
    active: boolean,
  ): Promise<IdentityDocumentType> {
    await this.findByIdOrFail(id);
    return this.identityDocumentTypesRepository.setActive(id, active);
  }
}