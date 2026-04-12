import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParishPriestResponseDto {
  @ApiProperty({ description: 'Identificador de la asignación.', example: '1' })
  id!: string;

  @ApiProperty({ description: 'Identificador de la parroquia.', example: '1' })
  parishId!: string;

  @ApiProperty({ description: 'Identificador del sacerdote.', example: '1' })
  priestId!: string;

  @ApiProperty({
    description: 'Indica si la asignación está activa.',
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
