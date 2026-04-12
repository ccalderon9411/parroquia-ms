import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBaptismRecordDto {
  @ApiProperty({ description: 'Identificador de la parroquia.', example: '1' })
  @IsString()
  parishId!: string;

  @ApiProperty({
    description: 'Identificador del sacerdote celebrante.',
    example: '1',
  })
  @IsString()
  priestId!: string;

  @ApiProperty({ description: 'Fecha del bautismo.', format: 'date-time' })
  @IsString()
  date!: string;

  @ApiProperty({
    description: 'Lugar del bautismo.',
    example: 'Templo principal',
  })
  @IsString()
  place!: string;

  @ApiProperty({ description: 'Numero de libro.', example: '1' })
  @IsString()
  bookNumber!: string;

  @ApiProperty({ description: 'Numero de folio.', example: '25' })
  @IsString()
  folioNumber!: string;

  @ApiProperty({ description: 'Numero de asiento.', example: '120' })
  @IsString()
  entryNumber!: string;

  @ApiProperty({
    description: 'Identificador de la persona bautizada.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @IsUUID()
  personId!: string;

  @ApiPropertyOptional({ description: 'Nombre del padrino.', nullable: true })
  @IsOptional()
  @IsString()
  godfather?: string;

  @ApiPropertyOptional({ description: 'Nombre de la madrina.', nullable: true })
  @IsOptional()
  @IsString()
  godmother?: string;

  @ApiPropertyOptional({
    description: 'Indica si el registro está activo.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que crea el registro.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
