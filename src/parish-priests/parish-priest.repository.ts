import { ParishPriest, Prisma } from '../prisma/generated/client';

export const PARISH_PRIEST_REPOSITORY = Symbol('PARISH_PRIEST_REPOSITORY');

export interface ParishPriestRepository {
  findAll(activeOnly?: boolean): Promise<ParishPriest[]>;
  findById(id: bigint): Promise<ParishPriest | null>;
  findActiveByParishAndPriest(
    parishId: bigint,
    priestId: bigint,
    excludeId?: bigint,
  ): Promise<ParishPriest | null>;
  create(data: Prisma.ParishPriestCreateInput): Promise<ParishPriest>;
  update(
    id: bigint,
    data: Prisma.ParishPriestUpdateInput,
  ): Promise<ParishPriest>;
  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<ParishPriest>;
  delete(id: bigint): Promise<ParishPriest>;
}
