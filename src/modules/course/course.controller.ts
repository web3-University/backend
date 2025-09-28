import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
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
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
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
      categories, free, priceRange, page, limit, keyword
    });
  }

  @Get('detailCourse')
  @ApiOperation({ summary: '根据ID获取课程详情' })
  @ApiResponse({ status: 200, description: '获取课程详情成功', type: Course })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async findOne(@Query('id') id: string): Promise<Course> {
    return await this.courseService.findOne(+id);
  }


  @Post('rateCourse')
  @ApiOperation({ summary: '评价课程（需要购买过课程，可重复评分）' })
  @ApiBody({
    description: '评价课程',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'number', description: '课程ID', example: 1 },
        walletAddress: { type: 'string', description: '钱包地址', example: '0x1234567890123456789012345678901234567890' },
        rating: { type: 'number', description: '评分（1-5）', example: 5 }
      },
      required: ['courseId', 'walletAddress', 'rating']
    }
  })
  @ApiResponse({ status: 200, description: '评价成功', type: Course })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '只有购买过课程的用户才能评分' })
  async rate(
    @Body('courseId') courseId: number,
    @Body('walletAddress') walletAddress: string,
    @Body('rating') rating: number,
  ): Promise<Course> {
    return await this.courseService.updateRating(courseId, walletAddress, rating);
  }


  @Post('deleteCourse')
  @ApiOperation({ summary: '删除课程' })
  @ApiResponse({ status: 200, description: '课程删除成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async remove(@Query('id') id: string): Promise<{ message: string }> {
    await this.courseService.remove(+id);
    return { message: '课程删除成功' };
  }

  // ========== 章节管理API ==========

  @Post('lessonsCreate')
  @ApiOperation({ summary: '为课程创建章节' })
  @ApiResponse({ status: 201, description: '章节创建成功', type: Lesson })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async createLesson(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    createLessonDto.courseId = +courseId;
    return await this.courseService.createLesson(createLessonDto);
  }

  @Get('lessonsList')
  @ApiOperation({ summary: '获取课程的所有章节' })
  @ApiResponse({ status: 200, description: '获取章节列表成功', type: [Lesson] })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async getCourseLessons(@Query('courseId') courseId: string): Promise<Lesson[]> {
    return await this.courseService.getCourseLessons(+courseId);
  }

  @Get('lessonsDetail')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiResponse({ status: 200, description: '获取章节详情成功', type: Lesson })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async getLesson(@Query('lessonId') lessonId: string): Promise<Lesson> {
    return await this.courseService.getLesson(+lessonId);
  }
}
