import { OmitType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateMarriageRecordDto } from './create-marriage-record.dto';

export class UpdateMarriageRecordDto extends PartialType(
  OmitType(CreateMarriageRecordDto, ['createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Usuario que actualiza el registro.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
