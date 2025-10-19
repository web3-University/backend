import {
  IsNumber,
  IsString,
  IsEthereumAddress,
  Length,
  Matches,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建提案 DTO
 */
export class CreateProposalDto {
  @ApiProperty({
    description: '课程ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  courseId: number;

  @ApiProperty({
    description: '发起原因/描述',
    example: '课程内容过时，讲师不回复学生问题',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @Length(10, 500, { message: '发起原因长度必须在10-500字符之间' })
  reason: string;

  @ApiProperty({
    description: '提案人钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsEthereumAddress({ message: '请输入有效的以太坊地址' })
  proposerWallet: string;

  @ApiProperty({
    description: '提案押金（YD币数量）',
    example: '1000',
  })
  @IsString()
  @Matches(/^\d+(\.\d+)?$/, { message: '提案押金必须是有效的数字' })
  proposalDeposit: string;
}
