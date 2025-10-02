import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

/**
 * 登录响应 DTO
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Access Token（短期令牌，15分钟有效）',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh Token（长期令牌，7天有效）',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: '用户信息',
    type: () => User,
  })
  user: User;

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
