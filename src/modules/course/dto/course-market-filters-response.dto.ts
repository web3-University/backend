import { ApiProperty } from '@nestjs/swagger';

export class CourseMarketFiltersResponseDto {
  @ApiProperty({ description: '课程分类列表', type: [String] })
  categories: string[];

  @ApiProperty({ description: '课程标签列表', type: [String] })
  tags: string[];

  @ApiProperty({ description: '课程难度列表', type: [String] })
  difficulties: string[];
}
