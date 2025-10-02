import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

/**
 * 登录 DTO
 */
export class LoginDto {
  @ApiProperty({
    description: '钱包地址',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsEthereumAddress({ message: '无效的以太坊地址' })
  @IsNotEmpty({ message: '钱包地址不能为空' })
  walletAddress: string;

  @ApiProperty({
    description: '签名后的消息',
    example: '0x1234567890abcdef...',
  })
  @IsString({ message: '签名必须是字符串' })
  @IsNotEmpty({ message: '签名不能为空' })
  signature: string;

  @ApiProperty({
    description: '原始消息内容',
    example: 'example.com wants you to sign in with your Ethereum account...',
  })
  @IsString({ message: '消息必须是字符串' })
  @IsNotEmpty({ message: '消息不能为空' })
  message: string;
}
