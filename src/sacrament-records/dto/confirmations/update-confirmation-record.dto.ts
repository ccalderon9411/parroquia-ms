import { OmitType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateConfirmationRecordDto } from './create-confirmation-record.dto';

export class UpdateConfirmationRecordDto extends PartialType(
  OmitType(CreateConfirmationRecordDto, ['createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Usuario que actualiza el registro.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
