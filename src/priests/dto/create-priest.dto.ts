import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePriestDto {
  @ApiProperty({
    description: 'Identificador de la persona asociada.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @IsUUID()
  personId!: string;

  @ApiPropertyOptional({
    description: 'Indica si el sacerdote está activo.',
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
