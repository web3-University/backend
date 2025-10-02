import { ApiProperty } from '@nestjs/swagger';

/**
 * Nonce 响应 DTO
 */
export class NonceResponseDto {
  @ApiProperty({
    description: '随机数（Nonce）',
    example: '2b5f8d3a9c1234567890abcdef',
  })
  nonce: string;

  @ApiProperty({
    description: '待签名的消息（符合 EIP-4361 标准）',
    example: 'example.com wants you to sign in with your Ethereum account...',
  })
  message: string;

  @ApiProperty({
    description: '过期时间（Unix 时间戳）',
    example: 1696147200,
  })
  expiresAt: number;
}
