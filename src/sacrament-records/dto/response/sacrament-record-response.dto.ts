import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SacramentType } from '../../../prisma/generated/client';

export class BaptismDetailResponseDto {
  @ApiProperty()
  personId!: string;

  @ApiPropertyOptional({ nullable: true })
  godfather!: string | null;

  @ApiPropertyOptional({ nullable: true })
  godmother!: string | null;
}

export class ConfirmationDetailResponseDto {
  @ApiProperty()
  personId!: string;

  @ApiPropertyOptional({ nullable: true })
  godfather!: string | null;

  @ApiPropertyOptional({ nullable: true })
  godmother!: string | null;
}

export class PersonSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  givenNames!: string;

  @ApiProperty()
  paternalSurname!: string;

  @ApiProperty()
  maternalSurname!: string;

  @ApiPropertyOptional({ nullable: true })
  father!: string | null;

  @ApiPropertyOptional({ nullable: true })
  mother!: string | null;
}

export class MarriageDetailResponseDto {
  @ApiProperty({ type: PersonSummaryResponseDto })
  groom!: PersonSummaryResponseDto;

  @ApiProperty({ format: 'date-time' })
  groomBaptismDate!: Date;

  @ApiProperty()
  groomBaptismPlace!: string;

  @ApiProperty({ type: PersonSummaryResponseDto })
  bride!: PersonSummaryResponseDto;

  @ApiProperty({ format: 'date-time' })
  brideBaptismDate!: Date;

  @ApiProperty()
  brideBaptismPlace!: string;

  @ApiProperty()
  witness1!: string;

  @ApiProperty()
  witness2!: string;
}

export class SacramentRecordResponseDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ enum: SacramentType })
  type!: SacramentType;

  @ApiProperty({ example: '1' })
  parishId!: string;

  @ApiProperty({ example: '1' })
  priestId!: string;

  @ApiProperty({ format: 'date-time' })
  date!: Date;

  @ApiProperty()
  place!: string;

  @ApiProperty()
  bookNumber!: string;

  @ApiProperty()
  folioNumber!: string;

  @ApiProperty()
  entryNumber!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  createdBy!: string | null;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ type: BaptismDetailResponseDto, nullable: true })
  baptismDetail!: BaptismDetailResponseDto | null;

  @ApiPropertyOptional({ type: ConfirmationDetailResponseDto, nullable: true })
  confirmationDetail!: ConfirmationDetailResponseDto | null;

  @ApiPropertyOptional({ type: MarriageDetailResponseDto, nullable: true })
  marriageDetail!: MarriageDetailResponseDto | null;
}
