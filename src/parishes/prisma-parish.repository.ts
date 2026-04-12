import { Injectable } from '@nestjs/common';
import { Parish, Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { ParishRepository } from './parish.repository';

@Injectable()
export class PrismaParishRepository implements ParishRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<Parish[]> {
    return this.prisma.parish.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: bigint): Promise<Parish | null> {
    return this.prisma.parish.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<Parish | null> {
    return this.prisma.parish.findUnique({ where: { name } });
  }

  create(data: Prisma.ParishCreateInput): Promise<Parish> {
    return this.prisma.parish.create({ data });
  }

  update(id: bigint, data: Prisma.ParishUpdateInput): Promise<Parish> {
    return this.prisma.parish.update({ where: { id }, data });
  }

  setActive(id: bigint, active: boolean, updatedBy?: string): Promise<Parish> {
    return this.prisma.parish.update({
      where: { id },
      data: { active, updatedBy },
    });
  }

  delete(id: bigint): Promise<Parish> {
    return this.prisma.parish.delete({ where: { id } });
  }
}
