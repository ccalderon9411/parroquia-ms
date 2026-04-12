import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParishResponseDto {
  @ApiProperty({ description: 'Identificador de la parroquia.', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Nombre de la parroquia.', example: 'San Pedro' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Dirección de la parroquia.',
    nullable: true,
  })
  address!: string | null;

  @ApiPropertyOptional({
    description: 'Teléfono de la parroquia.',
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({
    description: 'Indica si la parroquia está activa.',
    example: true,
  })
  active!: boolean;

  @ApiProperty({ description: 'Fecha de creación.', format: 'date-time' })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que creó el registro.',
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: 'Fecha de última actualización.',
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que actualizó el registro.',
    nullable: true,
  })
  updatedBy!: string | null;
}
