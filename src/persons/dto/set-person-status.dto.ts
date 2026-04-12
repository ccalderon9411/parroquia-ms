import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetPersonStatusDto {
  @ApiProperty({
    description: 'Indica si la persona debe quedar activa.',
    example: false,
  })
  @IsBoolean()
  active!: boolean;

  @ApiPropertyOptional({
    description: 'Usuario que realiza la actualizacion.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
