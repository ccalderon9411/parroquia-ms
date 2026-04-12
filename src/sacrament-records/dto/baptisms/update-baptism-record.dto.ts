import { OmitType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateBaptismRecordDto } from './create-baptism-record.dto';

export class UpdateBaptismRecordDto extends PartialType(
  OmitType(CreateBaptismRecordDto, ['createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Usuario que actualiza el registro.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
