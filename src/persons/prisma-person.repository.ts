import { Injectable } from '@nestjs/common';
import { Person, Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { PersonRepository } from './person.repository';

@Injectable()
export class PrismaPersonRepository implements PersonRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<Person[]> {
    return this.prisma.person.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ paternalSurname: 'asc' }, { maternalSurname: 'asc' }, { givenNames: 'asc' }],
    });
  }

  findById(id: string): Promise<Person | null> {
    return this.prisma.person.findUnique({
      where: { id },
    });
  }

  findByDocument(
    identityDocumentTypeId: bigint,
    identityDocumentNumber: string,
  ): Promise<Person | null> {
    return this.prisma.person.findUnique({
      where: {
        identityDocumentTypeId_identityDocumentNumber: {
          identityDocumentTypeId,
          identityDocumentNumber,
        },
      },
    });
  }

  create(data: Prisma.PersonCreateInput): Promise<Person> {
    return this.prisma.person.create({ data });
  }

  update(id: string, data: Prisma.PersonUpdateInput): Promise<Person> {
    return this.prisma.person.update({
      where: { id },
      data,
    });
  }

  setActive(id: string, active: boolean, updatedBy?: string): Promise<Person> {
    return this.prisma.person.update({
      where: { id },
      data: {
        active,
        updatedBy,
      },
    });
  }

  delete(id: string): Promise<Person> {
    return this.prisma.person.delete({
      where: { id },
    });
  }
}