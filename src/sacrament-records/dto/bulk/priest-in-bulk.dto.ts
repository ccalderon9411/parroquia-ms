import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

/**
 * Datos mínimos para identificar / crear un sacerdote en la importación masiva.
 * Si el sacerdote ya existe (mismo tipo + número de documento), se reutiliza;
 * si no, se crea la persona y luego el sacerdote.
 */
export class PriestInBulkDto {
  @ApiProperty({
    description: 'ID del tipo de documento del sacerdote.',
    example: '1',
  })
  @IsNumberString()
  docTypeId!: string;

  @ApiProperty({
    description: 'Número de documento del sacerdote.',
    example: '09876543',
  })
  @IsString()
  docNumber!: string;

  @ApiProperty({ description: 'Nombres del sacerdote.', example: 'Pedro' })
  @IsString()
  givenNames!: string;

  @ApiProperty({
    description: 'Apellido paterno del sacerdote.',
    example: 'Torres',
  })
  @IsString()
  paternalSurname!: string;

  @ApiProperty({
    description: 'Apellido materno del sacerdote.',
    example: 'Rios',
  })
  @IsString()
  maternalSurname!: string;
}
