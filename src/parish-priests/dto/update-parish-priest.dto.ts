import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateParishPriestDto } from './create-parish-priest.dto';

export class UpdateParishPriestDto extends PartialType(
  OmitType(CreateParishPriestDto, ['createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Usuario que actualiza el registro.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
