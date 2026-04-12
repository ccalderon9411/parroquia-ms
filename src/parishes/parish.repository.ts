import { Parish, Prisma } from '../prisma/generated/client';

export const PARISH_REPOSITORY = Symbol('PARISH_REPOSITORY');

export interface ParishRepository {
  findAll(activeOnly?: boolean): Promise<Parish[]>;
  findById(id: bigint): Promise<Parish | null>;
  findByName(name: string): Promise<Parish | null>;
  create(data: Prisma.ParishCreateInput): Promise<Parish>;
  update(id: bigint, data: Prisma.ParishUpdateInput): Promise<Parish>;
  setActive(id: bigint, active: boolean, updatedBy?: string): Promise<Parish>;
  delete(id: bigint): Promise<Parish>;
}
