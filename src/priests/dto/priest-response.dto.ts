import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonResponseDto } from '../../persons/dto/person-response.dto';

export class PriestResponseDto {
  @ApiProperty({ description: 'Identificador del sacerdote.', example: '1' })
  id!: string;

  @ApiProperty({
    description: 'Identificador de la persona asociada.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  personId!: string;

  @ApiProperty({
    description: 'Indica si el sacerdote está activo.',
    example: true,
  })
  active!: boolean;

  @ApiProperty({ description: 'Fecha de creación.', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Datos de la persona asociada al sacerdote.',
    type: PersonResponseDto,
  })
  person!: PersonResponseDto;

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
