import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { CourseMarketStatsResponseDto } from './dto/course-market-stats-response.dto';
import { CourseMarketFiltersResponseDto } from './dto/course-market-filters-response.dto';
import {
  CourseHighlightResponseDto,
} from './dto/course-highlight-response.dto';
import { InstructorDashboardResponseDto } from './dto/instructor-dashboard-response.dto';

@ApiTags('课程管理')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('createCourse')
  @ApiOperation({ summary: '创建课程（需要讲师或管理员权限）' })
  @ApiResponse({ status: 201, description: '课程创建成功', type: Course })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '只有讲师和管理员才能创建课程' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.create(createCourseDto);
  }

  @Get('myCourses')
  @ApiOperation({ summary: '获取我创建的课程' })
  @ApiQuery({ name: 'walletAddress', required: true, description: '钱包地址' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '获取课程列表成功', type: [Course] })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getMyCourses(
    @Query('walletAddress') walletAddress: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Course[]> {
    return await this.courseService.getUserCourses(walletAddress, page, limit);
  }

  @Post('list')
  @ApiOperation({ summary: '获取课程列表' })
  async findAll(
    @Body('page') page: number = 1,
    @Body('limit') limit: number = 10,
    @Body('categories') categories?: string[],
    @Body('free') free?: string,
    @Body('priceRange') priceRange?: string[],
    @Body('keyword') keyword?: string,
  ): Promise<Course[]> {
    return await this.courseService.findAll({
      categories,
      free,
      priceRange,
      page,
      limit,
      keyword,
    });
  }

  @Get('detailCourse')
  @ApiOperation({ summary: '根据ID获取课程详情' })
  @ApiResponse({ status: 200, description: '获取课程详情成功', type: Course })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async findOne(
    @Query('courseId', ParseIntPipe) courseId: number,
  ): Promise<Course> {
    return await this.courseService.findOne(courseId);
  }

  @Post('rateCourse')
  @ApiOperation({ summary: '评价课程（需要购买过课程，可重复评分）' })
  @ApiBody({
    description: '评价课程',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'number', description: '课程ID', example: 1 },
        walletAddress: {
          type: 'string',
          description: '钱包地址',
          example: '0x1234567890123456789012345678901234567890',
        },
        rating: { type: 'number', description: '评分（1-5）', example: 5 },
      },
      required: ['courseId', 'walletAddress', 'rating'],
    },
  })
  @ApiResponse({ status: 200, description: '评价成功', type: Course })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '只有购买过课程的用户才能评分' })
  async rate(
    @Body('courseId') courseId: number,
    @Body('walletAddress') walletAddress: string,
    @Body('rating') rating: number,
  ): Promise<Course> {
    return await this.courseService.updateRating(
      courseId,
      walletAddress,
      rating,
    );
  }

  // ========== 章节管理API ==========

  @Post('lessonsCreate')
  @ApiOperation({ summary: '为课程创建章节' })
  @ApiResponse({ status: 201, description: '章节创建成功', type: Lesson })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async createLesson(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    return await this.courseService.createLesson(createLessonDto);
  }

  @Get('lessonsList')
  @ApiOperation({ summary: '获取课程的所有章节' })
  @ApiResponse({ status: 200, description: '获取章节列表成功', type: [Lesson] })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async getCourseLessons(
    @Query('courseId') courseId: string,
  ): Promise<Lesson[]> {
    return await this.courseService.getCourseLessons(+courseId);
  }

  @Get('lessonsDetail')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiResponse({ status: 200, description: '获取章节详情成功', type: Lesson })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async getLesson(@Query('lessonId') lessonId: string): Promise<Lesson> {
    return await this.courseService.getLesson(+lessonId);
  }

  // 课程市场统计
  @Get('market/stats')
  @ApiOperation({ summary: '课程市场统计测试' })
  @ApiResponse({
    status: 200,
    description: '课程市场统计获取成功',
    type: CourseMarketStatsResponseDto,
  })
  async getMarketStats(): Promise<CourseMarketStatsResponseDto> {
    return await this.courseService.getCourseMarketStats();
  }

  // 课程市场筛选项
  @Get('market/filters')
  @ApiOperation({ summary: '课程市场筛选项测试' })
  @ApiResponse({
    status: 200,
    description: '课程筛选项获取成功',
    type: CourseMarketFiltersResponseDto,
  })
  async getMarketFilters(): Promise<CourseMarketFiltersResponseDto> {
    return await this.courseService.getCourseMarketFilters();
  }

  // 精选课程
  @Get('market/featured')
  @ApiOperation({ summary: '精选课程列表测试' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回的课程数量，默认6',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '精选课程获取成功',
    type: CourseHighlightResponseDto,
  })
  async getFeaturedCourses(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ): Promise<CourseHighlightResponseDto> {
    return await this.courseService.getFeaturedCourses(limit);
  }

  // 热门课程
  @Get('market/trending')
  @ApiOperation({ summary: '热门课程列表测试' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回的课程数量，默认6',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '热门课程获取成功',
    type: CourseHighlightResponseDto,
  })
  async getTrendingCourses(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ): Promise<CourseHighlightResponseDto> {
    return await this.courseService.getTrendingCourses(limit);
  }

  // 讲师中心概览
  @Get('instructor/dashboard')
  @ApiOperation({ summary: '讲师中心概览测试' })
  @ApiQuery({ name: 'walletAddress', description: '讲师钱包地址' })
  @ApiResponse({
    status: 200,
    description: '讲师中心概览获取成功',
    type: InstructorDashboardResponseDto,
  })
  async getInstructorDashboard(
    @Query('walletAddress') walletAddress: string,
  ): Promise<InstructorDashboardResponseDto> {
    return await this.courseService.getInstructorDashboard(walletAddress);
  }
}
