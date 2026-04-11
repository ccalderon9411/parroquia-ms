import { Person, Prisma } from '../prisma/generated/client';

export const PERSON_REPOSITORY = Symbol('PERSON_REPOSITORY');

export interface PersonRepository {
  findAll(activeOnly?: boolean): Promise<Person[]>;
  findById(id: string): Promise<Person | null>;
  findByDocument(
    identityDocumentTypeId: bigint,
    identityDocumentNumber: string,
  ): Promise<Person | null>;
  create(data: Prisma.PersonCreateInput): Promise<Person>;
  update(id: string, data: Prisma.PersonUpdateInput): Promise<Person>;
  setActive(id: string, active: boolean, updatedBy?: string): Promise<Person>;
  delete(id: string): Promise<Person>;
}