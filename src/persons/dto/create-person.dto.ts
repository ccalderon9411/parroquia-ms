import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  @IsNumberString()
  identityDocumentTypeId!: string;

  @ApiProperty({
    description: 'Numero de documento de identidad.',
    example: '12345678',
  })
  @IsString()
  identityDocumentNumber!: string;

  @ApiProperty({
    description: 'Nombres de la persona.',
    example: 'Juan Carlos',
  })
  @IsString()
  givenNames!: string;

  @ApiProperty({
    description: 'Apellido paterno de la persona.',
    example: 'Perez',
  })
  @IsString()
  paternalSurname!: string;

  @ApiProperty({
    description: 'Apellido materno de la persona.',
    example: 'Gomez',
  })
  @IsString()
  maternalSurname!: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento.',
    example: '1990-05-20T00:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Lugar de nacimiento.',
    example: 'Lima',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({
    description: 'Nombre del padre.',
    example: 'Jose Perez',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  father?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la madre.',
    example: 'Maria Gomez',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mother?: string;

  @ApiPropertyOptional({
    description: 'Indica si la persona esta activa.',
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