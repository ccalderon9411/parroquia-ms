import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetSacramentRecordStatusDto {
  @ApiProperty({
    description: 'Indica si el registro debe quedar activo.',
    example: false,
  })
  @IsBoolean()
  active!: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que actualiza el estado.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
