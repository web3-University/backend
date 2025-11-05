import { ApiProperty } from '@nestjs/swagger';

class RecentActivityItemDto {
  @ApiProperty({ description: '课程ID' })
  courseId: number;

  @ApiProperty({ description: '课程标题' })
  courseTitle: string;

  @ApiProperty({ description: '章节ID' })
  lessonId: number;

  @ApiProperty({ description: '章节标题' })
  lessonTitle: string;

  @ApiProperty({ description: '学习状态' })
  status: string;

  @ApiProperty({ description: '观看进度百分比（0-100）' })
  watchProgress: number;

  @ApiProperty({ description: '最近学习时间', nullable: true })
  lastWatchAt?: Date | null;
}

export class RecentActivityResponseDto {
  @ApiProperty({ description: '用户钱包地址' })
  walletAddress: string;

  @ApiProperty({
    description: '最近学习记录',
    type: [RecentActivityItemDto],
  })
  activities: RecentActivityItemDto[];
}
