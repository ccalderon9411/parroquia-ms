import { BadRequestException, Injectable } from '@nestjs/common';
import { SacramentType } from '../../prisma/generated/client';
import {
  CreateSacramentRecordInput,
  UpdateSacramentRecordInput,
} from '../sacrament-record.types';
import type { SacramentRecordWithDetails } from '../sacrament-record.repository';
import {
  SacramentStrategy,
  SacramentStrategyContext,
  SacramentRecordCreateDetail,
  SacramentRecordUpdateDetail,
} from './sacrament-strategy.interface';

@Injectable()
export class BaptismStrategy implements SacramentStrategy {
  readonly type = SacramentType.BAPTISM;

  async validateCreate(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (
      !input.baptismDetail ||
      input.confirmationDetail ||
      input.marriageDetail
    ) {
      throw new BadRequestException(
        'Para BAPTISM debe enviarse solo baptismDetail.',
      );
    }

    await context.ensurePersonExists(input.baptismDetail.personId);
  }

  buildCreateDetail(
    input: CreateSacramentRecordInput,
  ): SacramentRecordCreateDetail {
    if (!input.baptismDetail) {
      throw new BadRequestException('El detalle del bautismo es obligatorio.');
    }

    return {
      baptismDetail: {
        create: {
          person: { connect: { id: input.baptismDetail.personId } },
          godfather: input.baptismDetail.godfather,
          godmother: input.baptismDetail.godmother,
        },
      },
    };
  }

  async validateUpdate(
    _current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (input.confirmationDetail || input.marriageDetail) {
      throw new BadRequestException(
        'Un registro BAPTISM no puede actualizar detalles de otro tipo.',
      );
    }

    if (input.baptismDetail?.personId) {
      await context.ensurePersonExists(input.baptismDetail.personId);
    }
  }

  buildUpdateDetail(
    _current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
  ): SacramentRecordUpdateDetail {
    if (!input.baptismDetail) {
      return {};
    }

    return {
      baptismDetail: {
        update: {
          person:
            input.baptismDetail.personId === undefined
              ? undefined
              : { connect: { id: input.baptismDetail.personId } },
          godfather: input.baptismDetail.godfather,
          godmother: input.baptismDetail.godmother,
        },
      },
    };
  }
}
