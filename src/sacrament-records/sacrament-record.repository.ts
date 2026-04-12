import { Prisma, SacramentType } from '../prisma/generated/client';

export const SACRAMENT_RECORD_REPOSITORY = Symbol(
  'SACRAMENT_RECORD_REPOSITORY',
);

export type SacramentRecordWithDetails = Prisma.SacramentRecordGetPayload<{
  include: {
    baptismDetail: true;
    confirmationDetail: true;
    marriageDetail: {
      include: {
        groom: {
          select: {
            id: true;
            givenNames: true;
            paternalSurname: true;
            maternalSurname: true;
            father: true;
            mother: true;
          };
        };
        bride: {
          select: {
            id: true;
            givenNames: true;
            paternalSurname: true;
            maternalSurname: true;
            father: true;
            mother: true;
          };
        };
      };
    };
  };
}>;

export interface SacramentRecordRepository {
  findAll(filters?: {
    type?: SacramentType;
    activeOnly?: boolean;
  }): Promise<SacramentRecordWithDetails[]>;
  findById(id: bigint): Promise<SacramentRecordWithDetails | null>;
  findFirstByKey(params: {
    type: SacramentType;
    parishId: bigint;
    bookNumber: string;
    folioNumber: string;
    entryNumber: string;
    excludeId?: bigint;
  }): Promise<SacramentRecordWithDetails | null>;
  create(
    data: Prisma.SacramentRecordCreateInput,
  ): Promise<SacramentRecordWithDetails>;
  update(
    id: bigint,
    data: Prisma.SacramentRecordUpdateInput,
  ): Promise<SacramentRecordWithDetails>;
  setActive(
    id: bigint,
    active: boolean,
    updatedBy?: string,
  ): Promise<SacramentRecordWithDetails>;
  delete(id: bigint): Promise<SacramentRecordWithDetails>;
}
