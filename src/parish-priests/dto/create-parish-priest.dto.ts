import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateParishPriestDto {
  @ApiProperty({ description: 'Identificador de la parroquia.', example: '1' })
  @IsNumberString()
  parishId!: string;

  @ApiProperty({ description: 'Identificador del sacerdote.', example: '1' })
  @IsNumberString()
  priestId!: string;

  @ApiPropertyOptional({
    description: 'Indica si la asignación está activa.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que crea el registro.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
