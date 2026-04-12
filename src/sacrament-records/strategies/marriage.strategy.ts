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
export class MarriageStrategy implements SacramentStrategy {
  readonly type = SacramentType.MARRIAGE;

  async validateCreate(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (
      !input.marriageDetail ||
      input.baptismDetail ||
      input.confirmationDetail
    ) {
      throw new BadRequestException(
        'Para MARRIAGE debe enviarse solo marriageDetail.',
      );
    }

    if (input.marriageDetail.groomId === input.marriageDetail.brideId) {
      throw new BadRequestException(
        'El contrayente y la contrayente deben ser personas diferentes.',
      );
    }

    await context.ensurePersonExists(input.marriageDetail.groomId);
    await context.ensurePersonExists(input.marriageDetail.brideId);
  }

  buildCreateDetail(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): SacramentRecordCreateDetail {
    if (!input.marriageDetail) {
      throw new BadRequestException(
        'El detalle del matrimonio es obligatorio.',
      );
    }

    return {
      marriageDetail: {
        create: {
          groom: { connect: { id: input.marriageDetail.groomId } },
          groomBaptismDate: context.parseDate(
            input.marriageDetail.groomBaptismDate,
          ),
          groomBaptismPlace: input.marriageDetail.groomBaptismPlace,
          bride: { connect: { id: input.marriageDetail.brideId } },
          brideBaptismDate: context.parseDate(
            input.marriageDetail.brideBaptismDate,
          ),
          brideBaptismPlace: input.marriageDetail.brideBaptismPlace,
          witness1: input.marriageDetail.witness1,
          witness2: input.marriageDetail.witness2,
        },
      },
    };
  }

  async validateUpdate(
    current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void> {
    if (input.baptismDetail || input.confirmationDetail) {
      throw new BadRequestException(
        'Un registro MARRIAGE no puede actualizar detalles de otro tipo.',
      );
    }

    if (input.marriageDetail?.groomId) {
      await context.ensurePersonExists(input.marriageDetail.groomId);
    }

    if (input.marriageDetail?.brideId) {
      await context.ensurePersonExists(input.marriageDetail.brideId);
    }

    const currentMarriage = current.marriageDetail;
    const groomId = input.marriageDetail?.groomId ?? currentMarriage?.groomId;
    const brideId = input.marriageDetail?.brideId ?? currentMarriage?.brideId;

    if (groomId !== undefined && brideId !== undefined && groomId === brideId) {
      throw new BadRequestException(
        'El contrayente y la contrayente deben ser personas diferentes.',
      );
    }
  }

  buildUpdateDetail(
    _current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): SacramentRecordUpdateDetail {
    if (!input.marriageDetail) {
      return {};
    }

    return {
      marriageDetail: {
        update: {
          groom:
            input.marriageDetail.groomId === undefined
              ? undefined
              : { connect: { id: input.marriageDetail.groomId } },
          groomBaptismDate:
            input.marriageDetail.groomBaptismDate === undefined
              ? undefined
              : context.parseDate(input.marriageDetail.groomBaptismDate),
          groomBaptismPlace: input.marriageDetail.groomBaptismPlace,
          bride:
            input.marriageDetail.brideId === undefined
              ? undefined
              : { connect: { id: input.marriageDetail.brideId } },
          brideBaptismDate:
            input.marriageDetail.brideBaptismDate === undefined
              ? undefined
              : context.parseDate(input.marriageDetail.brideBaptismDate),
          brideBaptismPlace: input.marriageDetail.brideBaptismPlace,
          witness1: input.marriageDetail.witness1,
          witness2: input.marriageDetail.witness2,
        },
      },
    };
  }
}
