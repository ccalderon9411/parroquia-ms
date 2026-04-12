import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class PersonInBulkDto {
  @ApiProperty({
    description: 'ID del tipo de documento de identidad.',
    example: '1',
  })
  @IsNumberString()
  docTypeId!: string;

  @ApiProperty({
    description: 'Número de documento de identidad.',
    example: '12345678',
  })
  @IsString()
  docNumber!: string;

  @ApiProperty({ description: 'Nombres.', example: 'Juan Carlos' })
  @IsString()
  givenNames!: string;

  @ApiProperty({ description: 'Apellido paterno.', example: 'Perez' })
  @IsString()
  paternalSurname!: string;

  @ApiProperty({ description: 'Apellido materno.', example: 'Gomez' })
  @IsString()
  maternalSurname!: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento.',
    example: '1990-05-20',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Lugar de nacimiento.', example: 'Lima' })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({ description: 'Nombre del padre.' })
  @IsOptional()
  @IsString()
  father?: string;

  @ApiPropertyOptional({ description: 'Nombre de la madre.' })
  @IsOptional()
  @IsString()
  mother?: string;
}
