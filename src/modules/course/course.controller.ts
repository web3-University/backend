import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateApiDoc,
  getMyCoursesApiDoc,
  findAllApiDoc,
  findOneApiDoc,
  rateDoc,
  createLessonApiDoc,
  getCourseLessonsApiDoc,
  getLessonApiDoc,
} from './swagger-doc';

@ApiTags('课程管理')
// @UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create')
  @CreateApiDoc()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.create(createCourseDto);
  }

  @Get('my')
  @getMyCoursesApiDoc()
  async getMyCourses(
    @Query('walletAddress') walletAddress: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Course[]> {
    return await this.courseService.getUserCourses(walletAddress, page, limit);
  }

  @Post('list')
  @findAllApiDoc()
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

  @Get('detail')
  @findOneApiDoc()
  async findOne(
    @Query('courseId', ParseIntPipe) courseId: number,
  ): Promise<Course> {
    return await this.courseService.findOne(courseId);
  }

  @Post('rate')
  @rateDoc()
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
  @createLessonApiDoc()
  async createLesson(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    return await this.courseService.createLesson(createLessonDto);
  }

  @Get('lessonsList')
  @getCourseLessonsApiDoc()
  async getCourseLessons(
    @Query('courseId') courseId: string,
  ): Promise<Lesson[]> {
    return await this.courseService.getCourseLessons(+courseId);
  }

  @Get('lessonsDetail')
  @getLessonApiDoc()
  async getLesson(@Query('lessonId') lessonId: string): Promise<Lesson> {
    return await this.courseService.getLesson(+lessonId);
  }
}
