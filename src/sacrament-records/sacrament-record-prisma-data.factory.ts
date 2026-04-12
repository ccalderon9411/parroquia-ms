import { Injectable } from '@nestjs/common';
import { Prisma } from '../prisma/generated/client';
import {
  CreateSacramentRecordInput,
  UpdateSacramentRecordInput,
} from './sacrament-record.types';
import type { SacramentRecordWithDetails } from './sacrament-record.repository';
import { SacramentRecordSupportService } from './sacrament-record-support.service';
import type { SacramentStrategy } from './strategies/sacrament-strategy.interface';

interface SacramentRecordMutationPlan<TData> {
  parishId: bigint;
  priestId: bigint;
  bookNumber: string;
  folioNumber: string;
  entryNumber: string;
  data: TData;
}

@Injectable()
export class SacramentRecordPrismaDataFactory {
  constructor(private readonly support: SacramentRecordSupportService) {}

  buildCreatePlan(
    input: CreateSacramentRecordInput,
    strategy: SacramentStrategy,
  ): SacramentRecordMutationPlan<Prisma.SacramentRecordCreateInput> {
    const parishId = this.support.parseBigInt(input.parishId);
    const priestId = this.support.parseBigInt(input.priestId);

    return {
      parishId,
      priestId,
      bookNumber: input.bookNumber,
      folioNumber: input.folioNumber,
      entryNumber: input.entryNumber,
      data: {
        type: input.type,
        parish: { connect: { id: parishId } },
        priest: { connect: { id: priestId } },
        date: this.support.parseDate(input.date),
        place: input.place,
        bookNumber: input.bookNumber,
        folioNumber: input.folioNumber,
        entryNumber: input.entryNumber,
        active: input.active,
        createdBy: input.createdBy,
        updatedBy: input.createdBy,
        ...strategy.buildCreateDetail(input, this.support.strategyContext),
      },
    };
  }

  buildUpdatePlan(
    current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    strategy: SacramentStrategy,
  ): SacramentRecordMutationPlan<Prisma.SacramentRecordUpdateInput> {
    const parishId =
      input.parishId === undefined
        ? current.parishId
        : this.support.parseBigInt(input.parishId);
    const priestId =
      input.priestId === undefined
        ? current.priestId
        : this.support.parseBigInt(input.priestId);
    const bookNumber = input.bookNumber ?? current.bookNumber;
    const folioNumber = input.folioNumber ?? current.folioNumber;
    const entryNumber = input.entryNumber ?? current.entryNumber;

    return {
      parishId,
      priestId,
      bookNumber,
      folioNumber,
      entryNumber,
      data: {
        parish:
          input.parishId === undefined
            ? undefined
            : { connect: { id: parishId } },
        priest:
          input.priestId === undefined
            ? undefined
            : { connect: { id: priestId } },
        date:
          input.date === undefined
            ? undefined
            : this.support.parseDate(input.date),
        place: input.place,
        bookNumber: input.bookNumber,
        folioNumber: input.folioNumber,
        entryNumber: input.entryNumber,
        active: input.active,
        updatedBy: input.updatedBy,
        ...strategy.buildUpdateDetail(
          current,
          input,
          this.support.strategyContext,
        ),
      },
    };
  }
}
