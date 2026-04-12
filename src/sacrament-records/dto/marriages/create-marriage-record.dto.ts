import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMarriageRecordDto {
  @ApiProperty({ description: 'Identificador de la parroquia.', example: '1' })
  @IsString()
  parishId!: string;

  @ApiProperty({
    description: 'Identificador del sacerdote celebrante.',
    example: '1',
  })
  @IsString()
  priestId!: string;

  @ApiProperty({ description: 'Fecha del matrimonio.', format: 'date-time' })
  @IsString()
  date!: string;

  @ApiProperty({
    description: 'Lugar del matrimonio.',
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

  @ApiProperty({ description: 'Identificador del contrayente.' })
  @IsUUID()
  groomId!: string;

  @ApiProperty({
    description: 'Fecha de bautismo del contrayente.',
    format: 'date-time',
  })
  @IsString()
  groomBaptismDate!: string;

  @ApiProperty({ description: 'Lugar de bautismo del contrayente.' })
  @IsString()
  groomBaptismPlace!: string;

  @ApiProperty({ description: 'Identificador de la contrayente.' })
  @IsUUID()
  brideId!: string;

  @ApiProperty({
    description: 'Fecha de bautismo de la contrayente.',
    format: 'date-time',
  })
  @IsString()
  brideBaptismDate!: string;

  @ApiProperty({ description: 'Lugar de bautismo de la contrayente.' })
  @IsString()
  brideBaptismPlace!: string;

  @ApiProperty({ description: 'Primer testigo.' })
  @IsString()
  witness1!: string;

  @ApiProperty({ description: 'Segundo testigo.' })
  @IsString()
  witness2!: string;

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
