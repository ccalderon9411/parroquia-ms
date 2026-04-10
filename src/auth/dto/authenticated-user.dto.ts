import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({
    description: 'Identificador del usuario autenticado.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  userId!: string;

  @ApiProperty({
    description: 'Nombre de usuario autenticado.',
    example: 'admin',
  })
  username!: string;

  @ApiProperty({
    description: 'Identificador de la persona asociada.',
    example: '01HRM9YQ6Q4P5X3A4N5Z6B7C8D',
  })
  personId!: string;
}