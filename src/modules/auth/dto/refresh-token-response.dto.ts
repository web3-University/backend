import { ApiProperty } from '@nestjs/swagger';

/**
 * 刷新 Token 响应 DTO
 */
export class RefreshTokenResponseDto {
  @ApiProperty({
    description: '新的 Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '新的 Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token 类型',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Access Token 过期时间（秒）',
    example: 900,
  })
  expiresIn: number;
}
