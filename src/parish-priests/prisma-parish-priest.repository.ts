import { Injectable } from '@nestjs/common';
import { ParishPriest, Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { ParishPriestRepository } from './parish-priest.repository';

@Injectable()
export class PrismaParishPriestRepository implements ParishPriestRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<ParishPriest[]> {
    return this.prisma.parishPriest.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ parishId: 'asc' }, { priestId: 'asc' }, { id: 'asc' }],
    });
  }

  findById(id: bigint): Promise<ParishPriest | null> {
    return this.prisma.parishPriest.findUnique({ where: { id } });
  }

  findActiveByParishAndPriest(
    parishId: bigint,
    priestId: bigint,
    excludeId?: bigint,
  ): Promise<ParishPriest | null> {
    return this.prisma.parishPriest.findFirst({
      where: {
        parishId,
        priestId,
        active: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  create(data: Prisma.ParishPriestCreateInput): Promise<ParishPriest> {
    return this.prisma.parishPriest.create({ data });
  }

  update(
    id: bigint,
    data: Prisma.ParishPriestUpdateInput,
  ): Promise<ParishPriest> {
    return this.prisma.parishPriest.update({ where: { id }, data });
  }

  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<ParishPriest> {
    return this.prisma.parishPriest.update({
      where: { id },
      data: { active, updatedBy },
    });
  }

  delete(id: bigint): Promise<ParishPriest> {
    return this.prisma.parishPriest.delete({ where: { id } });
  }
}
