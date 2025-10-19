import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新 DAO 配置 DTO
 */
export class UpdateDAOConfigDto {
  @ApiProperty({
    description: '提案押金（YD币数量）',
    example: '1000',
    required: false,
  })
  @IsOptional()
  @IsString()
  proposalDeposit?: string;

  @ApiProperty({
    description: '最小投票权重（YD币数量）',
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsString()
  minVotingPower?: string;

  @ApiProperty({
    description: '投票期限（秒）',
    example: 604800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(3600) // 最少1小时
  @Max(2592000) // 最多30天
  votingPeriod?: number;

  @ApiProperty({
    description: '法定人数百分比（基点，10000 = 100%）',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100) // 最少1%
  @Max(5000) // 最多50%
  quorumPercentage?: number;

  @ApiProperty({
    description: '通过阈值（基点，10000 = 100%）',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(3000) // 最少30%
  @Max(7000) // 最多70%
  passThreshold?: number;

  @ApiProperty({
    description: '奖励池百分比（基点，10000 = 100%）',
    example: 8000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(5000) // 最少50%
  @Max(9500) // 最多95%
  rewardPoolPercentage?: number;

  @ApiProperty({
    description: '取消提案时间限制（秒）',
    example: 86400,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(3600) // 最少1小时
  @Max(604800) // 最多7天
  cancelTimeLimit?: number;

  @ApiProperty({
    description: '是否启用DAO功能',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    description: '管理员钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminWallet?: string;
}
