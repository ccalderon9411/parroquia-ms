import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateParishDto } from './create-parish.dto';

export class UpdateParishDto extends PartialType(
  OmitType(CreateParishDto, ['createdBy'] as const),
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
