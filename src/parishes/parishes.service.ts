import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Parish, Prisma } from '../prisma/generated/client';
import { PARISH_REPOSITORY, ParishRepository } from './parish.repository';

@Injectable()
export class ParishesService {
  constructor(
    @Inject(PARISH_REPOSITORY)
    private readonly parishesRepository: ParishRepository,
  ) {}

  findAll(activeOnly?: boolean): Promise<Parish[]> {
    return this.parishesRepository.findAll(activeOnly);
  }

  findById(id: bigint): Promise<Parish | null> {
    return this.parishesRepository.findById(id);
  }

  async findByIdOrFail(id: bigint): Promise<Parish> {
    const parish = await this.findById(id);

    if (!parish) {
      throw new NotFoundException('Parroquia no encontrada.');
    }

    return parish;
  }

  findByName(name: string): Promise<Parish | null> {
    return this.parishesRepository.findByName(name);
  }

  async create(data: {
    name: string;
    address?: string;
    phone?: string;
    active?: boolean;
    createdBy?: string;
  }): Promise<Parish> {
    await this.ensureNameAvailable(data.name);

    return this.parishesRepository.create({
      name: data.name,
      address: data.address,
      phone: data.phone,
      active: data.active,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    });
  }

  async update(
    id: bigint,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      active?: boolean;
      updatedBy?: string;
    },
  ): Promise<Parish> {
    const current = await this.findByIdOrFail(id);

    if (data.name !== undefined && data.name !== current.name) {
      await this.ensureNameAvailable(data.name);
    }

    const updateData: Prisma.ParishUpdateInput = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      active: data.active,
      updatedBy: data.updatedBy,
    };

    return this.parishesRepository.update(id, updateData);
  }

  async setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<Parish> {
    await this.findByIdOrFail(id);
    return this.parishesRepository.setActive(id, active, updatedBy);
  }

  async delete(id: bigint): Promise<Parish> {
    await this.findByIdOrFail(id);
    return this.parishesRepository.delete(id);
  }

  private async ensureNameAvailable(name: string): Promise<void> {
    const existing = await this.findByName(name);

    if (existing) {
      throw new ConflictException('Ya existe una parroquia con ese nombre.');
    }
  }
}
