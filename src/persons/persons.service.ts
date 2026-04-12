import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdentityDocumentTypesService } from '../identity-document-types/identity-document-types.service';
import { Person, Prisma } from '../prisma/generated/client';
import { PERSON_REPOSITORY, PersonRepository } from './person.repository';

@Injectable()
export class PersonsService {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personsRepository: PersonRepository,
    private readonly identityDocumentTypesService: IdentityDocumentTypesService,
  ) {}

  findAll(activeOnly?: boolean): Promise<Person[]> {
    return this.personsRepository.findAll(activeOnly);
  }

  findById(id: string): Promise<Person | null> {
    return this.personsRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<Person> {
    const person = await this.findById(id);

    if (!person) {
      throw new NotFoundException('Persona no encontrada.');
    }

    return person;
  }

  findByDocument(
    identityDocumentTypeId: bigint,
    identityDocumentNumber: string,
  ): Promise<Person | null> {
    return this.personsRepository.findByDocument(
      identityDocumentTypeId,
      identityDocumentNumber,
    );
  }

  async create(data: {
    identityDocumentTypeId: bigint;
    identityDocumentNumber: string;
    givenNames: string;
    paternalSurname: string;
    maternalSurname: string;
    birthDate?: Date;
    birthPlace?: string;
    father?: string;
    mother?: string;
    active?: boolean;
    createdBy?: string;
  }): Promise<Person> {
    await this.identityDocumentTypesService.findByIdOrFail(
      data.identityDocumentTypeId,
    );
    await this.ensureDocumentAvailable(
      data.identityDocumentTypeId,
      data.identityDocumentNumber,
    );

    return this.personsRepository.create({
      identityDocumentNumber: data.identityDocumentNumber,
      givenNames: data.givenNames,
      paternalSurname: data.paternalSurname,
      maternalSurname: data.maternalSurname,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,
      father: data.father,
      mother: data.mother,
      active: data.active,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      identityDocumentType: {
        connect: { id: data.identityDocumentTypeId },
      },
    });
  }

  async update(
    id: string,
    data: {
      identityDocumentTypeId?: bigint;
      identityDocumentNumber?: string;
      givenNames?: string;
      paternalSurname?: string;
      maternalSurname?: string;
      birthDate?: Date;
      birthPlace?: string;
      father?: string;
      mother?: string;
      active?: boolean;
      updatedBy?: string;
    },
  ): Promise<Person> {
    const current = await this.findByIdOrFail(id);
    const nextIdentityDocumentTypeId =
      data.identityDocumentTypeId ?? current.identityDocumentTypeId;
    const nextIdentityDocumentNumber =
      data.identityDocumentNumber ?? current.identityDocumentNumber;

    if (data.identityDocumentTypeId !== undefined) {
      await this.identityDocumentTypesService.findByIdOrFail(
        data.identityDocumentTypeId,
      );
    }

    if (
      nextIdentityDocumentTypeId !== current.identityDocumentTypeId ||
      nextIdentityDocumentNumber !== current.identityDocumentNumber
    ) {
      await this.ensureDocumentAvailable(
        nextIdentityDocumentTypeId,
        nextIdentityDocumentNumber,
      );
    }

    const updateData: Prisma.PersonUpdateInput = {
      identityDocumentNumber: data.identityDocumentNumber,
      givenNames: data.givenNames,
      paternalSurname: data.paternalSurname,
      maternalSurname: data.maternalSurname,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,
      father: data.father,
      mother: data.mother,
      active: data.active,
      updatedBy: data.updatedBy,
    };

    if (data.identityDocumentTypeId !== undefined) {
      updateData.identityDocumentType = {
        connect: { id: data.identityDocumentTypeId },
      };
    }

    return this.personsRepository.update(id, updateData);
  }

  async setActive(
    id: string,
    active: boolean,
    updatedBy?: string,
  ): Promise<Person> {
    await this.findByIdOrFail(id);
    return this.personsRepository.setActive(id, active, updatedBy);
  }

  async delete(id: string): Promise<Person> {
    await this.findByIdOrFail(id);
    return this.personsRepository.delete(id);
  }

  private async ensureDocumentAvailable(
    identityDocumentTypeId: bigint,
    identityDocumentNumber: string,
  ): Promise<void> {
    const existing = await this.findByDocument(
      identityDocumentTypeId,
      identityDocumentNumber,
    );

    if (existing) {
      throw new ConflictException(
        'Ya existe una persona con ese tipo y numero de documento.',
      );
    }
  }
}
