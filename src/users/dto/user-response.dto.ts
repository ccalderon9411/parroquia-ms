import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador del usuario.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  id!: string;

  @ApiProperty({
    description: 'Identificador de la persona asociada.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  personId!: string;

  @ApiProperty({
    description: 'Nombre de usuario único.',
    example: 'admin',
  })
  username!: string;

  @ApiProperty({
    description: 'Indica si el usuario está activo.',
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro.',
    example: '2026-04-10T05:45:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que creó el registro.',
    example: 'admin',
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: 'Fecha de la última actualización del registro.',
    example: '2026-04-10T05:45:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Usuario que realizó la última modificación.',
    example: 'admin',
    nullable: true,
  })
  updatedBy!: string | null;
}
