import { SacramentType } from '../prisma/generated/client';

export interface BaptismDetailInput {
  personId: string;
  godfather?: string;
  godmother?: string;
}

export interface ConfirmationDetailInput {
  personId: string;
  godfather?: string;
  godmother?: string;
}

export interface MarriageDetailInput {
  groomId: string;
  groomBaptismDate: string;
  groomBaptismPlace: string;
  brideId: string;
  brideBaptismDate: string;
  brideBaptismPlace: string;
  witness1: string;
  witness2: string;
}

export interface CreateSacramentRecordInput {
  type: SacramentType;
  parishId: string;
  priestId: string;
  date: string;
  place: string;
  bookNumber: string;
  folioNumber: string;
  entryNumber: string;
  active?: boolean;
  createdBy?: string;
  baptismDetail?: BaptismDetailInput;
  confirmationDetail?: ConfirmationDetailInput;
  marriageDetail?: MarriageDetailInput;
}

export interface UpdateBaptismDetailInput {
  personId?: string;
  godfather?: string;
  godmother?: string;
}

export interface UpdateConfirmationDetailInput {
  personId?: string;
  godfather?: string;
  godmother?: string;
}

export interface UpdateMarriageDetailInput {
  groomId?: string;
  groomBaptismDate?: string;
  groomBaptismPlace?: string;
  brideId?: string;
  brideBaptismDate?: string;
  brideBaptismPlace?: string;
  witness1?: string;
  witness2?: string;
}

export interface UpdateSacramentRecordInput {
  parishId?: string;
  priestId?: string;
  date?: string;
  place?: string;
  bookNumber?: string;
  folioNumber?: string;
  entryNumber?: string;
  active?: boolean;
  updatedBy?: string;
  baptismDetail?: UpdateBaptismDetailInput;
  confirmationDetail?: UpdateConfirmationDetailInput;
  marriageDetail?: UpdateMarriageDetailInput;
}
