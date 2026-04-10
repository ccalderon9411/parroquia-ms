import { Injectable } from '@nestjs/common';
import { Prisma, User } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<User[]> {
    return this.prisma.user.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { username: 'asc' },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  findByPersonId(personId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { personId },
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  setActive(id: string, active: boolean, updatedBy?: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        active,
        updatedBy,
      },
    });
  }

  delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}