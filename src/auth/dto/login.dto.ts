import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nombre de usuario.',
    example: 'admin',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Contraseña del usuario.',
    example: 'P@ssw0rd',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}