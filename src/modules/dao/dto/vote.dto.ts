import {
  IsNumber,
  IsString,
  IsEthereumAddress,
  Matches,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 投票 DTO
 */
export class VoteDto {
  @ApiProperty({
    description: '投票选项 (0: For支持课程, 1: Against反对课程)',
    example: 1,
    enum: [0, 1],
  })
  @IsNumber()
  @IsIn([0, 1], { message: '投票选项必须是0(For)或1(Against)' })
  option: number;

  @ApiProperty({
    description: '投票人钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsEthereumAddress({ message: '请输入有效的以太坊地址' })
  voterWallet: string;

  @ApiProperty({
    description: '投票权重（锁定的YD币数量）',
    example: '1000',
  })
  @IsString()
  @Matches(/^\d+(\.\d+)?$/, { message: '投票权重必须是有效的数字' })
  votingPower: string;
}
