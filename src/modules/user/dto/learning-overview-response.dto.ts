import { ApiProperty } from '@nestjs/swagger';

export class LearningOverviewResponseDto {
  @ApiProperty({ description: '用户钱包地址' })
  walletAddress: string;

  @ApiProperty({ description: '在学课程数量' })
  activeCourses: number;

  @ApiProperty({ description: '已完成课程数量' })
  completedCourses: number;

  @ApiProperty({ description: '已购买课程数量' })
  purchasedCourses: number;

  @ApiProperty({ description: '连续学习天数' })
  streakDays: number;

  @ApiProperty({ description: '学习者等级（基于完成课程数量）' })
  learnerLevel: string;

  @ApiProperty({ description: '当前YD代币余额' })
  ydBalance: string;
}
