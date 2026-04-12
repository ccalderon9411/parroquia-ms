import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class UpdatePersonDto extends PartialType(
  OmitType(CreatePersonDto, ['createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Usuario que realiza la actualizacion.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
