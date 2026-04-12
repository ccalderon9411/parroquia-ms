import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParishPriest, Prisma } from '../prisma/generated/client';
import { ParishesService } from '../parishes/parishes.service';
import { PriestsService } from '../priests/priests.service';
import {
  PARISH_PRIEST_REPOSITORY,
  ParishPriestRepository,
} from './parish-priest.repository';

@Injectable()
export class ParishPriestsService {
  constructor(
    @Inject(PARISH_PRIEST_REPOSITORY)
    private readonly parishPriestsRepository: ParishPriestRepository,
    private readonly parishesService: ParishesService,
    private readonly priestsService: PriestsService,
  ) {}

  findAll(activeOnly?: boolean): Promise<ParishPriest[]> {
    return this.parishPriestsRepository.findAll(activeOnly);
  }

  findById(id: bigint): Promise<ParishPriest | null> {
    return this.parishPriestsRepository.findById(id);
  }

  async findByIdOrFail(id: bigint): Promise<ParishPriest> {
    const parishPriest = await this.findById(id);

    if (!parishPriest) {
      throw new NotFoundException(
        'Asignación de parroquia y sacerdote no encontrada.',
      );
    }

    return parishPriest;
  }

  async create(data: {
    parishId: bigint;
    priestId: bigint;
    active?: boolean;
    createdBy?: string;
  }): Promise<ParishPriest> {
    await this.parishesService.findByIdOrFail(data.parishId);
    await this.priestsService.findByIdOrFail(data.priestId);

    if (data.active !== false) {
      await this.ensureActiveAssignmentAvailable(data.parishId, data.priestId);
    }

    return this.parishPriestsRepository.create({
      active: data.active,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      parish: { connect: { id: data.parishId } },
      priest: { connect: { id: data.priestId } },
    });
  }

  async update(
    id: bigint,
    data: {
      parishId?: bigint;
      priestId?: bigint;
      active?: boolean;
      updatedBy?: string;
    },
  ): Promise<ParishPriest> {
    const current = await this.findByIdOrFail(id);
    const nextParishId = data.parishId ?? current.parishId;
    const nextPriestId = data.priestId ?? current.priestId;
    const nextActive = data.active ?? current.active;

    if (data.parishId !== undefined) {
      await this.parishesService.findByIdOrFail(data.parishId);
    }

    if (data.priestId !== undefined) {
      await this.priestsService.findByIdOrFail(data.priestId);
    }

    if (nextActive) {
      await this.ensureActiveAssignmentAvailable(
        nextParishId,
        nextPriestId,
        id,
      );
    }

    const updateData: Prisma.ParishPriestUpdateInput = {
      active: data.active,
      updatedBy: data.updatedBy,
    };

    if (data.parishId !== undefined) {
      updateData.parish = { connect: { id: data.parishId } };
    }

    if (data.priestId !== undefined) {
      updateData.priest = { connect: { id: data.priestId } };
    }

    return this.parishPriestsRepository.update(id, updateData);
  }

  async setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<ParishPriest> {
    const current = await this.findByIdOrFail(id);

    if (active) {
      await this.ensureActiveAssignmentAvailable(
        current.parishId,
        current.priestId,
        id,
      );
    }

    return this.parishPriestsRepository.setActive(id, active, updatedBy);
  }

  async delete(id: bigint): Promise<ParishPriest> {
    await this.findByIdOrFail(id);
    return this.parishPriestsRepository.delete(id);
  }

  private async ensureActiveAssignmentAvailable(
    parishId: bigint,
    priestId: bigint,
    excludeId?: bigint,
  ): Promise<void> {
    const existing =
      await this.parishPriestsRepository.findActiveByParishAndPriest(
        parishId,
        priestId,
        excludeId,
      );

    if (existing) {
      throw new ConflictException(
        'Ya existe una asignación activa para esa parroquia y sacerdote.',
      );
    }
  }
}
