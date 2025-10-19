import { IsString, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 领取奖励 DTO
 */
export class ClaimRewardDto {
  @ApiProperty({
    description: '投票人钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsEthereumAddress({ message: '请输入有效的以太坊地址' })
  voterWallet: string;
}
