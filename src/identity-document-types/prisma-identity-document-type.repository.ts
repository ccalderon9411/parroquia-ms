import { Injectable } from '@nestjs/common';
import { IdentityDocumentType, Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityDocumentTypeRepository } from './identity-document-type.repository';

@Injectable()
export class PrismaIdentityDocumentTypeRepository implements IdentityDocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activeOnly?: boolean): Promise<IdentityDocumentType[]> {
    return this.prisma.identityDocumentType.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { abbreviation: 'asc' },
    });
  }

  findById(id: bigint): Promise<IdentityDocumentType | null> {
    return this.prisma.identityDocumentType.findUnique({
      where: { id },
    });
  }

  findByAbbreviation(
    abbreviation: string,
  ): Promise<IdentityDocumentType | null> {
    return this.prisma.identityDocumentType.findUnique({
      where: { abbreviation },
    });
  }

  create(
    data: Prisma.IdentityDocumentTypeCreateInput,
  ): Promise<IdentityDocumentType> {
    return this.prisma.identityDocumentType.create({ data });
  }

  update(
    id: bigint,
    data: Prisma.IdentityDocumentTypeUpdateInput,
  ): Promise<IdentityDocumentType> {
    return this.prisma.identityDocumentType.update({
      where: { id },
      data,
    });
  }

  setActive(id: bigint, active: boolean): Promise<IdentityDocumentType> {
    return this.prisma.identityDocumentType.update({
      where: { id },
      data: { active },
    });
  }

  delete(id: bigint): Promise<IdentityDocumentType> {
    return this.prisma.identityDocumentType.delete({
      where: { id },
    });
  }
}
