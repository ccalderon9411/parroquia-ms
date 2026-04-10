import { Prisma, User } from '../prisma/generated/client';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findAll(activeOnly?: boolean): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPersonId(personId: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  setActive(id: string, active: boolean, updatedBy?: string): Promise<User>;
  delete(id: string): Promise<User>;
}