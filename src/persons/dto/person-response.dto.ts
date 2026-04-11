import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({
    description: 'Identificador de la persona.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  id!: string;

  @ApiProperty({
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  identityDocumentTypeId!: string;

  @ApiProperty({
    description: 'Numero de documento de identidad.',
    example: '12345678',
  })
  identityDocumentNumber!: string;

  @ApiProperty({
    description: 'Nombres de la persona.',
    example: 'Juan Carlos',
  })
  givenNames!: string;

  @ApiProperty({
    description: 'Apellido paterno de la persona.',
    example: 'Perez',
  })
  paternalSurname!: string;

  @ApiProperty({
    description: 'Apellido materno de la persona.',
    example: 'Gomez',
  })
  maternalSurname!: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento.',
    example: '1990-05-20T00:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  birthDate!: Date | null;

  @ApiPropertyOptional({
    description: 'Lugar de nacimiento.',
    example: 'Lima',
    nullable: true,
  })
  birthPlace!: string | null;

  @ApiPropertyOptional({
    description: 'Nombre del padre.',
    example: 'Jose Perez',
    nullable: true,
  })
  father!: string | null;

  @ApiPropertyOptional({
    description: 'Nombre de la madre.',
    example: 'Maria Gomez',
    nullable: true,
  })
  mother!: string | null;

  @ApiProperty({
    description: 'Indica si la persona esta activa.',
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro.',
    example: '2026-04-10T05:45:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que creó el registro.',
    example: 'admin',
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: 'Fecha de la última actualización del registro.',
    example: '2026-04-10T05:45:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que realizó la última modificación.',
    example: 'admin',
    nullable: true,
  })
  updatedBy!: string | null;
}