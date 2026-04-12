import { BadRequestException } from '@nestjs/common';
import { SacramentType } from '../../prisma/generated/client';
import { SacramentRecordResponseDto } from '../dto/response/sacrament-record-response.dto';
import { SacramentRecordWithDetails } from '../sacrament-record.repository';
import { SacramentRecordsService } from '../sacrament-records.service';

export abstract class SacramentRecordsControllerBase {
  protected constructor(
    protected readonly sacramentRecordsService: SacramentRecordsService,
  ) {}

  protected parseId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new BadRequestException('El id debe ser un entero valido.');
    }
  }

  protected parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    throw new BadRequestException(
      'El parametro activeOnly debe ser true o false.',
    );
  }

  protected async findByIdAndType(
    id: bigint,
    type: SacramentType,
  ): Promise<SacramentRecordWithDetails> {
    const record = await this.sacramentRecordsService.findByIdOrFail(id);
    if (record.type !== type) {
      throw new BadRequestException(
        'El registro no corresponde al tipo de sacramento solicitado.',
      );
    }
    return record;
  }

  protected toResponseDto(
    record: SacramentRecordWithDetails,
  ): SacramentRecordResponseDto {
    return {
      id: record.id.toString(),
      type: record.type,
      parishId: record.parishId.toString(),
      priestId: record.priestId.toString(),
      date: record.date,
      place: record.place,
      bookNumber: record.bookNumber,
      folioNumber: record.folioNumber,
      entryNumber: record.entryNumber,
      active: record.active,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      updatedAt: record.updatedAt,
      updatedBy: record.updatedBy,
      baptismDetail: record.baptismDetail
        ? {
            personId: record.baptismDetail.personId,
            godfather: record.baptismDetail.godfather,
            godmother: record.baptismDetail.godmother,
          }
        : null,
      confirmationDetail: record.confirmationDetail
        ? {
            personId: record.confirmationDetail.personId,
            godfather: record.confirmationDetail.godfather,
            godmother: record.confirmationDetail.godmother,
          }
        : null,
      marriageDetail: record.marriageDetail
        ? {
            groom: {
              id: record.marriageDetail.groom.id,
              givenNames: record.marriageDetail.groom.givenNames,
              paternalSurname: record.marriageDetail.groom.paternalSurname,
              maternalSurname: record.marriageDetail.groom.maternalSurname,
              father: record.marriageDetail.groom.father,
              mother: record.marriageDetail.groom.mother,
            },
            groomBaptismDate: record.marriageDetail.groomBaptismDate,
            groomBaptismPlace: record.marriageDetail.groomBaptismPlace,
            bride: {
              id: record.marriageDetail.bride.id,
              givenNames: record.marriageDetail.bride.givenNames,
              paternalSurname: record.marriageDetail.bride.paternalSurname,
              maternalSurname: record.marriageDetail.bride.maternalSurname,
              father: record.marriageDetail.bride.father,
              mother: record.marriageDetail.bride.mother,
            },
            brideBaptismDate: record.marriageDetail.brideBaptismDate,
            brideBaptismPlace: record.marriageDetail.brideBaptismPlace,
            witness1: record.marriageDetail.witness1,
            witness2: record.marriageDetail.witness2,
          }
        : null,
    };
  }
}
