import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkImportRowErrorDto {
  @ApiProperty({
    description: 'Número de fila (1-based, sin encabezado).',
    example: 2,
  })
  row!: number;

  @ApiProperty({
    description: 'Mensaje de error.',
    example: 'Parroquia no encontrada.',
  })
  message!: string;
}

export class BulkImportResultDto {
  @ApiProperty({ description: 'Total de filas procesadas.', example: 50 })
  total!: number;

  @ApiProperty({ description: 'Registros creados correctamente.', example: 48 })
  succeeded!: number;

  @ApiProperty({ description: 'Registros con error.', example: 2 })
  failed!: number;

  @ApiPropertyOptional({ type: BulkImportRowErrorDto, isArray: true })
  errors!: BulkImportRowErrorDto[];
}
