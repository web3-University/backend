import { ApiProperty } from '@nestjs/swagger';

export class CourseMarketStatsResponseDto {
  @ApiProperty({ description: '课程总数' })
  totalCourses: number;

  @ApiProperty({ description: '累计学生数量' })
  totalStudents: number;

  @ApiProperty({ description: '平均课程价格（YD）' })
  averagePrice: number;

  @ApiProperty({ description: '免费课程数量' })
  freeCourseCount: number;

  @ApiProperty({ description: '付费课程数量' })
  paidCourseCount: number;
}
