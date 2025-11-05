import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户学习统计响应 DTO
 */
export class LearningStatsResponseDto {
  @ApiProperty({
    description: '用户钱包地址',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress: string;

  @ApiProperty({
    description: '与用户关联的课程总数（购买或加入学习）',
    example: 8,
  })
  totalCourses: number;

  @ApiProperty({
    description: '已购买课程数量',
    example: 5,
  })
  purchasedCount: number;

  @ApiProperty({
    description: '正在学习的课程数量',
    example: 2,
  })
  inProgressCount: number;

  @ApiProperty({
    description: '已完成的课程数量',
    example: 1,
  })
  completedCount: number;

  @ApiProperty({
    description: '尚未开始学习的课程数量',
    example: 2,
  })
  notStartedCount: number;

  @ApiProperty({
    description: '最近一次学习记录的更新时间（ISO 字符串），无记录时为 null',
    example: '2024-06-01T08:00:00.000Z',
    nullable: true,
  })
  lastActivityAt: Date | null;
}
