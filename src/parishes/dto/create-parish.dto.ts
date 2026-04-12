import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateParishDto {
  @ApiProperty({ description: 'Nombre de la parroquia.', example: 'San Pedro' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Dirección de la parroquia.',
    example: 'Av. Principal 123',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de la parroquia.',
    example: '999888777',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Indica si la parroquia está activa.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que crea el registro.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
