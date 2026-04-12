import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IdentityDocumentTypeResponseDto {
  @ApiProperty({
    description: 'Identificador del tipo de documento.',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Abreviatura única del tipo de documento.',
    example: 'DNI',
  })
  abbreviation!: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de documento.',
    example: 'Documento Nacional de Identidad',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Indica si el tipo de documento está activo.',
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
