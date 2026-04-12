import { Prisma, SacramentType } from '../../prisma/generated/client';
import {
  CreateSacramentRecordInput,
  UpdateSacramentRecordInput,
} from '../sacrament-record.types';
import type { SacramentRecordWithDetails } from '../sacrament-record.repository';

export type SacramentRecordCreateDetail = Pick<
  Prisma.SacramentRecordCreateInput,
  'baptismDetail' | 'confirmationDetail' | 'marriageDetail'
>;

export type SacramentRecordUpdateDetail = Pick<
  Prisma.SacramentRecordUpdateInput,
  'baptismDetail' | 'confirmationDetail' | 'marriageDetail'
>;

export interface SacramentStrategyContext {
  ensurePersonExists(id: string): Promise<void>;
  parseDate(value: string): Date;
}

export interface SacramentStrategy {
  readonly type: SacramentType;
  validateCreate(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void>;
  buildCreateDetail(
    input: CreateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): SacramentRecordCreateDetail;
  validateUpdate(
    current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): Promise<void>;
  buildUpdateDetail(
    current: SacramentRecordWithDetails,
    input: UpdateSacramentRecordInput,
    context: SacramentStrategyContext,
  ): SacramentRecordUpdateDetail;
}
