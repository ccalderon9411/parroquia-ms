import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../prisma/generated/client';
import { PersonsService } from '../persons/persons.service';
import {
  PRIEST_REPOSITORY,
  PriestRepository,
  PriestWithPerson,
} from './priest.repository';

@Injectable()
export class PriestsService {
  constructor(
    @Inject(PRIEST_REPOSITORY)
    private readonly priestsRepository: PriestRepository,
    private readonly personsService: PersonsService,
  ) {}

  findAll(activeOnly?: boolean): Promise<PriestWithPerson[]> {
    return this.priestsRepository.findAll(activeOnly);
  }

  findById(id: bigint): Promise<PriestWithPerson | null> {
    return this.priestsRepository.findById(id);
  }

  async findByIdOrFail(id: bigint): Promise<PriestWithPerson> {
    const priest = await this.findById(id);

    if (!priest) {
      throw new NotFoundException('Sacerdote no encontrado.');
    }

    return priest;
  }

  findByPersonId(personId: string): Promise<PriestWithPerson | null> {
    return this.priestsRepository.findByPersonId(personId);
  }

  async create(data: {
    personId: string;
    active?: boolean;
    createdBy?: string;
  }): Promise<PriestWithPerson> {
    await this.personsService.findByIdOrFail(data.personId);
    await this.ensurePersonAvailable(data.personId);

    return this.priestsRepository.create({
      active: data.active,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      person: { connect: { id: data.personId } },
    });
  }

  async update(
    id: bigint,
    data: {
      personId?: string;
      active?: boolean;
      updatedBy?: string;
    },
  ): Promise<PriestWithPerson> {
    const current = await this.findByIdOrFail(id);
    const nextPersonId = data.personId ?? current.personId;

    if (data.personId !== undefined) {
      await this.personsService.findByIdOrFail(data.personId);
    }

    if (nextPersonId !== current.personId) {
      await this.ensurePersonAvailable(nextPersonId);
    }

    const updateData: Prisma.PriestUpdateInput = {
      active: data.active,
      updatedBy: data.updatedBy,
    };

    if (data.personId !== undefined) {
      updateData.person = {
        connect: { id: data.personId },
      };
    }

    return this.priestsRepository.update(id, updateData);
  }

  async setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<PriestWithPerson> {
    await this.findByIdOrFail(id);
    return this.priestsRepository.setActive(id, active, updatedBy);
  }

  async delete(id: bigint): Promise<PriestWithPerson> {
    await this.findByIdOrFail(id);
    return this.priestsRepository.delete(id);
  }

  private async ensurePersonAvailable(personId: string): Promise<void> {
    const existing = await this.findByPersonId(personId);

    if (existing) {
      throw new ConflictException('Ya existe un sacerdote para esa persona.');
    }
  }
}
