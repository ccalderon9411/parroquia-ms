import { Prisma } from '../prisma/generated/client';

export const PRIEST_REPOSITORY = Symbol('PRIEST_REPOSITORY');

export type PriestWithPerson = Prisma.PriestGetPayload<{
  include: { person: true };
}>;

export interface PriestRepository {
  findAll(activeOnly?: boolean): Promise<PriestWithPerson[]>;
  findById(id: bigint): Promise<PriestWithPerson | null>;
  findByPersonId(personId: string): Promise<PriestWithPerson | null>;
  create(data: Prisma.PriestCreateInput): Promise<PriestWithPerson>;
  update(id: bigint, data: Prisma.PriestUpdateInput): Promise<PriestWithPerson>;
  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<PriestWithPerson>;
  delete(id: bigint): Promise<PriestWithPerson>;
}
