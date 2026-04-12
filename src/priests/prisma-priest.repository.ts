import { Injectable } from '@nestjs/common';
import { Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { PriestRepository, PriestWithPerson } from './priest.repository';

@Injectable()
export class PrismaPriestRepository implements PriestRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<PriestWithPerson[]> {
    return this.prisma.priest.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { id: 'asc' },
      include: { person: true },
    });
  }

  findById(id: bigint): Promise<PriestWithPerson | null> {
    return this.prisma.priest.findUnique({
      where: { id },
      include: { person: true },
    });
  }

  findByPersonId(personId: string): Promise<PriestWithPerson | null> {
    return this.prisma.priest.findUnique({
      where: { personId },
      include: { person: true },
    });
  }

  create(data: Prisma.PriestCreateInput): Promise<PriestWithPerson> {
    return this.prisma.priest.create({ data, include: { person: true } });
  }

  update(
    id: bigint,
    data: Prisma.PriestUpdateInput,
  ): Promise<PriestWithPerson> {
    return this.prisma.priest.update({
      where: { id },
      data,
      include: { person: true },
    });
  }

  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<PriestWithPerson> {
    return this.prisma.priest.update({
      where: { id },
      data: { active, updatedBy },
      include: { person: true },
    });
  }

  delete(id: bigint): Promise<PriestWithPerson> {
    return this.prisma.priest.delete({
      where: { id },
      include: { person: true },
    });
  }
}
