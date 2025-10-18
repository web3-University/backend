import { ApiProperty } from '@nestjs/swagger';

class InstructorCourseSnapshotDto {
  @ApiProperty({ description: '课程ID' })
  courseId: number;

  @ApiProperty({ description: '课程标题' })
  title: string;

  @ApiProperty({ description: '课程评分' })
  rating: number;

  @ApiProperty({ description: '课程状态' })
  status: string;

  @ApiProperty({ description: '学生数量' })
  studentCount: number;

  @ApiProperty({ description: '课程收入估算（YD）' })
  revenue: number;

  @ApiProperty({ description: '最近更新时间' })
  updatedAt: Date;
}

export class InstructorDashboardResponseDto {
  @ApiProperty({ description: '讲师钱包地址' })
  walletAddress: string;

  @ApiProperty({ description: '课程总数' })
  totalCourses: number;

  @ApiProperty({ description: '学生总数' })
  totalStudents: number;

  @ApiProperty({ description: '课程平均评分' })
  averageRating: number;

  @ApiProperty({ description: '累计收入估算（YD）' })
  estimatedTotalRevenue: number;

  @ApiProperty({
    description: '近期课程表现快照',
    type: [InstructorCourseSnapshotDto],
  })
  recentCourses: InstructorCourseSnapshotDto[];
}
