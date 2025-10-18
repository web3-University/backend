import { ApiProperty } from '@nestjs/swagger';

class AchievementItemDto {
  @ApiProperty({ description: '成就唯一标识' })
  code: string;

  @ApiProperty({ description: '成就名称' })
  title: string;

  @ApiProperty({ description: '成就描述' })
  description: string;

  @ApiProperty({ description: '是否已达成' })
  achieved: boolean;

  @ApiProperty({ description: '达成时间', nullable: true })
  achievedAt?: Date | null;

  @ApiProperty({ description: '成就进度，0-1之间的小数' })
  progress: number;
}

export class AchievementResponseDto {
  @ApiProperty({ description: '用户钱包地址' })
  walletAddress: string;

  @ApiProperty({ description: '成就列表', type: [AchievementItemDto] })
  achievements: AchievementItemDto[];
}
