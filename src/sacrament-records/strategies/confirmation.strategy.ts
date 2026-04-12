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
export class ConfirmationStrategy implements SacramentStrategy {
  readonly type = SacramentType.CONFIRMATION;

  async validateCreate(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (
      !input.confirmationDetail ||
      input.baptismDetail ||
      input.marriageDetail
    ) {
      throw new BadRequestException(
        'Para CONFIRMATION debe enviarse solo confirmationDetail.',
      );
    }

    await context.ensurePersonExists(input.confirmationDetail.personId);
  }

  buildCreateDetail(
    input: CreateSacramentRecordInput,
  ): SacramentRecordCreateDetail {
    if (!input.confirmationDetail) {
      throw new BadRequestException(
        'El detalle de la confirmación es obligatorio.',
      );
    }

    return {
      confirmationDetail: {
        create: {
          person: { connect: { id: input.confirmationDetail.personId } },
          godfather: input.confirmationDetail.godfather,
          godmother: input.confirmationDetail.godmother,
        },
      },
    };
  }

  async validateUpdate(
    _current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (input.baptismDetail || input.marriageDetail) {
      throw new BadRequestException(
        'Un registro CONFIRMATION no puede actualizar detalles de otro tipo.',
      );
    }

    if (input.confirmationDetail?.personId) {
      await context.ensurePersonExists(input.confirmationDetail.personId);
    }
  }

  buildUpdateDetail(
    _current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
  ): SacramentRecordUpdateDetail {
    if (!input.confirmationDetail) {
      return {};
    }

    return {
      confirmationDetail: {
        update: {
          person:
            input.confirmationDetail.personId === undefined
              ? undefined
              : { connect: { id: input.confirmationDetail.personId } },
          godfather: input.confirmationDetail.godfather,
          godmother: input.confirmationDetail.godmother,
        },
      },
    };
  }
}
