import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdentityDocumentTypeDto {
  @ApiProperty({
    description: 'Abreviatura única del tipo de documento.',
    example: 'DNI',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  abbreviation!: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de documento.',
    example: 'Documento Nacional de Identidad',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Indica si el tipo de documento está activo.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}