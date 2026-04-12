import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetParishPriestStatusDto {
  @ApiProperty({
    description: 'Indica si la asignación debe quedar activa.',
    example: false,
  })
  @IsBoolean()
  active!: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que realiza la actualización.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
