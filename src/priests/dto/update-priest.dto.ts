import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreatePriestDto } from './create-priest.dto';

export class UpdatePriestDto extends PartialType(
  OmitType(CreatePriestDto, ['createdBy'] as const),
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
