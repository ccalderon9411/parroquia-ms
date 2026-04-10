import { IdentityDocumentType, Prisma } from '../prisma/generated/client';

export const IDENTITY_DOCUMENT_TYPE_REPOSITORY = Symbol('IDENTITY_DOCUMENT_TYPE_REPOSITORY');

export interface IdentityDocumentTypeRepository {
  findAll(activeOnly?: boolean): Promise<IdentityDocumentType[]>;
  findById(id: bigint): Promise<IdentityDocumentType | null>;
  findByAbbreviation(
    abbreviation: string,
  ): Promise<IdentityDocumentType | null>;
  create(
    data: Prisma.IdentityDocumentTypeCreateInput,
  ): Promise<IdentityDocumentType>;
  update(
    id: bigint,
    data: Prisma.IdentityDocumentTypeUpdateInput,
  ): Promise<IdentityDocumentType>;
  setActive(id: bigint, active: boolean): Promise<IdentityDocumentType>;
  delete(id: bigint): Promise<IdentityDocumentType>;
}