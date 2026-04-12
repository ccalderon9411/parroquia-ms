import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SacramentType } from '../prisma/generated/client';
import {
  SACRAMENT_RECORD_REPOSITORY,
  SacramentRecordWithDetails,
} from './sacrament-record.repository';
import type { SacramentRecordRepository } from './sacrament-record.repository';
import { SacramentRecordPrismaDataFactory } from './sacrament-record-prisma-data.factory';
import { SacramentRecordSupportService } from './sacrament-record-support.service';
import {
  CreateSacramentRecordInput,
  UpdateSacramentRecordInput,
} from './sacrament-record.types';
import { BaptismStrategy } from './strategies/baptism.strategy';
import { ConfirmationStrategy } from './strategies/confirmation.strategy';
import { MarriageStrategy } from './strategies/marriage.strategy';
import type { SacramentStrategy } from './strategies/sacrament-strategy.interface';

@Injectable()
export class SacramentRecordsService {
  private readonly strategies: ReadonlyMap<SacramentType, SacramentStrategy>;

  constructor(
    @Inject(SACRAMENT_RECORD_REPOSITORY)
    private readonly sacramentRecordRepository: SacramentRecordRepository,
    private readonly support: SacramentRecordSupportService,
    private readonly prismaDataFactory: SacramentRecordPrismaDataFactory,
    baptismStrategy: BaptismStrategy,
    confirmationStrategy: ConfirmationStrategy,
    marriageStrategy: MarriageStrategy,
  ) {
    this.strategies = new Map(
      [baptismStrategy, confirmationStrategy, marriageStrategy].map(
        (strategy) => [strategy.type, strategy],
      ),
    );
  }

  findAll(filters?: {
    type?: SacramentType;
    activeOnly?: boolean;
  }): Promise<SacramentRecordWithDetails[]> {
    return this.sacramentRecordRepository.findAll(filters);
  }

  findById(id: bigint): Promise<SacramentRecordWithDetails | null> {
    return this.sacramentRecordRepository.findById(id);
  }

  async findByIdOrFail(id: bigint): Promise<SacramentRecordWithDetails> {
    const record = await this.findById(id);

    if (!record) {
      throw new NotFoundException('Registro sacramental no encontrado.');
    }

    return record;
  }

  async create(
    createSacramentRecordDto: CreateSacramentRecordInput,
  ): Promise<SacramentRecordWithDetails> {
    const strategy = this.getStrategy(createSacramentRecordDto.type);
    const plan = this.prismaDataFactory.buildCreatePlan(
      createSacramentRecordDto,
      strategy,
    );

    await this.support.ensureParishExists(plan.parishId);
    await this.support.ensurePriestExists(plan.priestId);
    await this.support.ensureUniqueKey({
      type: createSacramentRecordDto.type,
      parishId: plan.parishId,
      bookNumber: plan.bookNumber,
      folioNumber: plan.folioNumber,
      entryNumber: plan.entryNumber,
    });
    await strategy.validateCreate(
      createSacramentRecordDto,
      this.support.strategyContext,
    );

    return this.sacramentRecordRepository.create(plan.data);
  }

  async update(
    id: bigint,
    updateSacramentRecordDto: UpdateSacramentRecordInput,
  ): Promise<SacramentRecordWithDetails> {
    const current = await this.findByIdOrFail(id);
    const strategy = this.getStrategy(current.type);
    const plan = this.prismaDataFactory.buildUpdatePlan(
      current,
      updateSacramentRecordDto,
      strategy,
    );

    if (updateSacramentRecordDto.parishId !== undefined) {
      await this.support.ensureParishExists(plan.parishId);
    }

    if (updateSacramentRecordDto.priestId !== undefined) {
      await this.support.ensurePriestExists(plan.priestId);
    }

    await this.support.ensureUniqueKey({
      type: current.type,
      parishId: plan.parishId,
      bookNumber: plan.bookNumber,
      folioNumber: plan.folioNumber,
      entryNumber: plan.entryNumber,
      excludeId: id,
    });
    await strategy.validateUpdate(
      current,
      updateSacramentRecordDto,
      this.support.strategyContext,
    );

    return this.sacramentRecordRepository.update(id, plan.data);
  }

  async setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<SacramentRecordWithDetails> {
    await this.findByIdOrFail(id);
    return this.sacramentRecordRepository.setActive(id, active, updatedBy);
  }

  async delete(id: bigint): Promise<SacramentRecordWithDetails> {
    await this.findByIdOrFail(id);
    return this.sacramentRecordRepository.delete(id);
  }

  private getStrategy(type: SacramentType): SacramentStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new NotFoundException('Tipo de sacramento no soportado.');
    }

    return strategy;
  }
}
