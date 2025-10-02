import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

/**
 * 请求 Nonce DTO
 */
export class NonceRequestDto {
  @ApiProperty({
    description: '钱包地址',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsEthereumAddress({ message: '无效的以太坊地址' })
  @IsNotEmpty({ message: '钱包地址不能为空' })
  walletAddress: string;
}
