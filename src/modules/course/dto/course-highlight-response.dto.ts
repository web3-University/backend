import { ApiProperty } from '@nestjs/swagger';

export class CourseHighlightItemDto {
  @ApiProperty({ description: '课程ID' })
  courseId: number;

  @ApiProperty({ description: '课程标题' })
  title: string;

  @ApiProperty({ description: '封面地址', nullable: true })
  cover?: string | null;

  @ApiProperty({ description: '课程分类', type: [String] })
  categories: string[];

  @ApiProperty({ description: '课程标签', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: '课程评分' })
  rating: number;

  @ApiProperty({ description: '学习人数' })
  studentCount: number;

  @ApiProperty({ description: '价格（YD）' })
  price: string;

  @ApiProperty({ description: '是否免费（1表示免费，0表示付费）' })
  isFree: string;
}

export class CourseHighlightResponseDto {
  @ApiProperty({ description: '推荐课程列表', type: [CourseHighlightItemDto] })
  items: CourseHighlightItemDto[];
}
