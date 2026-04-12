import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SacramentType } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SACRAMENT_RECORD_REPOSITORY,
  type SacramentRecordRepository,
} from './sacrament-record.repository';
import type { SacramentStrategyContext } from './strategies/sacrament-strategy.interface';

@Injectable()
export class SacramentRecordSupportService {
  constructor(
    @Inject(SACRAMENT_RECORD_REPOSITORY)
    private readonly sacramentRecordRepository: SacramentRecordRepository,
    private readonly prisma: PrismaService,
  ) {}

  readonly strategyContext: SacramentStrategyContext = {
    ensurePersonExists: async (id: string) => this.ensurePersonExists(id),
    parseDate: (value: string) => this.parseDate(value),
  };

  async ensureParishExists(id: bigint): Promise<void> {
    const parish = await this.prisma.parish.findUnique({ where: { id } });
    if (!parish) {
      throw new NotFoundException('Parroquia no encontrada.');
    }
  }

  async ensurePriestExists(id: bigint): Promise<void> {
    const priest = await this.prisma.priest.findUnique({ where: { id } });
    if (!priest) {
      throw new NotFoundException('Sacerdote no encontrado.');
    }
  }

  async ensureUniqueKey(params: {
    type: SacramentType;
    parishId: bigint;
    bookNumber: string;
    folioNumber: string;
    entryNumber: string;
    excludeId?: bigint;
  }): Promise<void> {
    const existing =
      await this.sacramentRecordRepository.findFirstByKey(params);
    if (existing) {
      throw new ConflictException(
        'Ya existe un registro sacramental con esa parroquia, tipo, libro, folio y asiento.',
      );
    }
  }

  parseBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('El valor debe ser un entero valido.');
    }
  }

  parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La fecha no tiene un formato valido.');
    }
    return date;
  }

  private async ensurePersonExists(id: string): Promise<void> {
    const person = await this.prisma.person.findUnique({ where: { id } });
    if (!person) {
      throw new NotFoundException('Persona no encontrada.');
    }
  }
}
