import { ApiProperty } from '@nestjs/swagger';

class WeeklyProgressDailyItem {
  @ApiProperty({ description: '日期，格式YYYY-MM-DD' })
  date: string;

  @ApiProperty({ description: '当日学习时长（小时）' })
  hours: number;
}

export class WeeklyProgressResponseDto {
  @ApiProperty({ description: '用户钱包地址' })
  walletAddress: string;

  @ApiProperty({ description: '每周学习目标时长（小时）', default: 10 })
  targetHours: number;

  @ApiProperty({ description: '本周已学习时长（小时）' })
  actualHours: number;

  @ApiProperty({ description: '完成度，0-100之间的百分比' })
  completionRate: number;

  @ApiProperty({
    description: '每日学习时长分布',
    type: [WeeklyProgressDailyItem],
  })
  dailyBreakdown: WeeklyProgressDailyItem[];
}
