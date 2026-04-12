import { Injectable } from '@nestjs/common';
import { Prisma, SacramentType } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SacramentRecordRepository,
  SacramentRecordWithDetails,
} from './sacrament-record.repository';

@Injectable()
export class PrismaSacramentRecordRepository implements SacramentRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: {
    type?: SacramentType;
    activeOnly?: boolean;
  }): Promise<SacramentRecordWithDetails[]> {
    return this.prisma.sacramentRecord.findMany({
      where: {
        type: filters?.type,
        ...(filters?.activeOnly ? { active: true } : {}),
      },
      include: this.detailInclude,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
  }

  findById(id: bigint): Promise<SacramentRecordWithDetails | null> {
    return this.prisma.sacramentRecord.findUnique({
      where: { id },
      include: this.detailInclude,
    });
  }

  findFirstByKey(params: {
    type: SacramentType;
    parishId: bigint;
    bookNumber: string;
    folioNumber: string;
    entryNumber: string;
    excludeId?: bigint;
  }): Promise<SacramentRecordWithDetails | null> {
    return this.prisma.sacramentRecord.findFirst({
      where: {
        type: params.type,
        parishId: params.parishId,
        bookNumber: params.bookNumber,
        folioNumber: params.folioNumber,
        entryNumber: params.entryNumber,
        ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
      },
      include: this.detailInclude,
    });
  }

  create(
    data: Prisma.SacramentRecordCreateInput,
  ): Promise<SacramentRecordWithDetails> {
    return this.prisma.sacramentRecord.create({
      data,
      include: this.detailInclude,
    });
  }

  update(
    id: bigint,
    data: Prisma.SacramentRecordUpdateInput,
  ): Promise<SacramentRecordWithDetails> {
    return this.prisma.sacramentRecord.update({
      where: { id },
      data,
      include: this.detailInclude,
    });
  }

  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<SacramentRecordWithDetails> {
    return this.prisma.sacramentRecord.update({
      where: { id },
      data: { active, updatedBy },
      include: this.detailInclude,
    });
  }

  delete(id: bigint): Promise<SacramentRecordWithDetails> {
    return this.prisma.sacramentRecord.delete({
      where: { id },
      include: this.detailInclude,
    });
  }

  private readonly detailInclude = {
    baptismDetail: true,
    confirmationDetail: true,
    marriageDetail: {
      include: {
        groom: {
          select: {
            id: true,
            givenNames: true,
            paternalSurname: true,
            maternalSurname: true,
            father: true,
            mother: true,
          },
        },
        bride: {
          select: {
            id: true,
            givenNames: true,
            paternalSurname: true,
            maternalSurname: true,
            father: true,
            mother: true,
          },
        },
      },
    },
  } satisfies Prisma.SacramentRecordInclude;
}
