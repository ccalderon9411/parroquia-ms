import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Identificador de la persona asociada al usuario.',
    example: '4d6c7d9e-4d7f-4ef5-a311-5f6f5b1f5d11',
  })
  @IsUUID()
  personId!: string;

  @ApiProperty({
    description: 'Nombre de usuario único.',
    example: 'admin',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Contraseña del usuario.',
    example: 'P@ssw0rd',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo.',
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