import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetPriestStatusDto {
  @ApiProperty({
    description: 'Indica si el sacerdote debe quedar activo.',
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
