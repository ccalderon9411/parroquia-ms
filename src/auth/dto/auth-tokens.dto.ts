import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT de acceso.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT de refresco.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  refreshToken!: string;
}
