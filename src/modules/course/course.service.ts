import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { UserCourseProgress } from './entities/user-course.entity';
import { User } from '../user/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CourseMarketStatsResponseDto } from './dto/course-market-stats-response.dto';
import { CourseMarketFiltersResponseDto } from './dto/course-market-filters-response.dto';
import {
  CourseHighlightItemDto,
  CourseHighlightResponseDto,
} from './dto/course-highlight-response.dto';
import { InstructorDashboardResponseDto } from './dto/instructor-dashboard-response.dto';
import { IS_FREE } from 'src/config/constant';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(UserCourseProgress)
    private userCourseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建课程（需要验证用户身份和权限）
   */
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress: createCourseDto.walletAddress },
    });

    if (!user) {
      throw new NotFoundException(
        `用户钱包地址 ${createCourseDto.walletAddress} 不存在`,
      );
    }

    // 验证讲师是否已注册和审核通过
    // if (!user.isInstructorRegistered || !user.isInstructorApproved) {
    //   throw new ForbiddenException('讲师需要先注册并通过审核才能创建课程');
    // }

    // 设置讲师信息
    const courseData = {
      ...createCourseDto,
      instructorId: user.userId,
      instructorWallet: user.walletAddress,
    };
    const course = this.courseRepository.create(courseData);
    const savedCourse = await this.courseRepository.save(course);
    return savedCourse;
  }

  /**
   * 获取用户创建的课程
   */
  async getUserCourses(
    walletAddress: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any[]> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const courses = await this.courseRepository.find({
      where: { instructorWallet: user.walletAddress },
      order: { createdAt: 'DESC' },
      relations: ['lessons', 'userProgresses'], // 包含关联数据以支持动态计算
      skip: (page - 1) * limit,
      take: limit,
    });

    // 手动添加计算字段，确保 getter 方法的值被包含在返回结果中
    return courses.map((course) => ({
      ...course,
      studentCount: course.studentCount,
      lessonCount: course.lessonCount,
      reviewCount: course.reviewCount,
      purchaseCount: course.purchaseCount,
      completionCount: course.completionCount,
      averageRating: course.averageRating,
    }));
  }

  /**
   * 获取所有课程
   */
  async findAll({
    page,
    limit,
    free,
    priceRange,
    keyword,
    categories,
  }: {
    page: number;
    limit: number;
    categories?: string[];
    free?: string;
    priceRange?: string[];
    keyword?: string;
  }): Promise<any[]> {
    // 构建查询条件
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.lessons', 'lessons')
      .leftJoinAndSelect('course.userProgresses', 'userProgresses')
      .orderBy('course.createdAt', 'DESC');

    // 分类筛选 - 使用 JSON 包含操作符
    if (categories?.length) {
      // 使用 PostgreSQL 的 @> 操作符检查 JSON 数组是否包含任意一个分类
      // 对于多个分类，检查是否包含其中任意一个
      const categoryConditions = categories
        .map(
          (_, index) => `course.categories::jsonb @> :category${index}::jsonb`,
        )
        .join(' OR ');
      queryBuilder.andWhere(`(${categoryConditions})`, {
        ...categories.reduce(
          (acc, category, index) => {
            acc[`category${index}`] = JSON.stringify([category]);
            return acc;
          },
          {} as Record<string, string>,
        ),
      });
    }

    // 免费/付费筛选
    if (free !== undefined) {
      queryBuilder.andWhere('course.isFree = :isFree', { isFree: free });
    }

    // 价格范围筛选
    if (priceRange?.length === 2) {
      queryBuilder.andWhere('course.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('course.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // 分页
    queryBuilder.skip((page - 1) * limit).take(limit);

    const courses = await queryBuilder.getMany();

    // 手动添加计算字段，确保 getter 方法的值被包含在返回结果中
    return courses.map((course) => ({
      ...course,
      studentCount: course.studentCount,
      lessonCount: course.lessonCount,
      reviewCount: course.reviewCount,
      purchaseCount: course.purchaseCount,
      completionCount: course.completionCount,
      averageRating: course.averageRating,
    }));
  }

  /**
   * 根据ID获取课程
   */
  async findOne(courseId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { courseId: courseId },
      relations: ['lessons', 'userProgresses'], // 包含关联数据以支持动态计算
    });
    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }
    return course;
  }

  /**
   * 更新课程评分（需要验证用户是否购买过课程）
   */
  async updateRating(
    courseId: number,
    walletAddress: string,
    rating: number,
  ): Promise<Course> {
    // 验证课程是否存在
    const course = await this.findOne(courseId);
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }
    // 验证用户是否购买过该课程
    const userProgress = await this.userCourseProgressRepository.findOne({
      where: { walletAddress, courseId: courseId, isPurchased: true },
    });

    if (!userProgress) {
      throw new ForbiddenException('只有购买过该课程的用户才能评分');
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      throw new ForbiddenException('评分必须在1-5之间');
    }

    // 更新用户评分记录（允许修改评分）
    userProgress.userRating = rating;
    userProgress.ratedAt = new Date();
    await this.userCourseProgressRepository.save(userProgress);

    // 计算课程平均评分
    const allRatings = await this.userCourseProgressRepository.find({
      where: { courseId: courseId, userRating: Not(IsNull()) },
      select: ['userRating'],
    });

    const totalRating = allRatings.reduce(
      (sum, progress) => sum + (progress.userRating || 0),
      0,
    );
    const averageRating =
      allRatings.length > 0 ? totalRating / allRatings.length : 0;

    // 更新课程评分
    course.rating = Math.round(averageRating * 100) / 100; // 保留两位小数
    // reviewCount 现在通过 getter 方法动态计算，无需手动更新

    return await this.courseRepository.save(course);
  }

  // ========== 章节管理方法 ==========
  /**
   * 创建章节
   */
  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // 验证课程是否存在
    await this.findOne(createLessonDto.courseId);
    const lesson = this.lessonRepository.create(createLessonDto);
    const savedLesson = await this.lessonRepository.save(lesson);
    return savedLesson;
  }

  /**
   * 获取课程的所有章节
   */
  async getCourseLessons(courseId: number): Promise<Lesson[]> {
    await this.findOne(courseId); // 验证课程存在

    return await this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  /**
   * 获取章节详情
   */
  async getLesson(lessonId: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { lessonId },
    });
    if (!lesson) {
      throw new NotFoundException(`章节ID ${lessonId} 不存在`);
    }
    return lesson;
  }

  /**
   * 获取课程市场统计
   */
  async getCourseMarketStats(): Promise<CourseMarketStatsResponseDto> {
    const courses = await this.courseRepository.find();
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.studentCount || 0),
      0,
    );
    const numericPrices = courses
      .map((course) => this.parsePrice(course.price))
      .filter((price) => !Number.isNaN(price));
    const averagePrice =
      numericPrices.length > 0
        ? Number(
            (
              numericPrices.reduce((sum, price) => sum + price, 0) /
              numericPrices.length
            ).toFixed(2),
          )
        : 0;

    const freeCourseCount = courses.filter(
      (course) => course.isFree === IS_FREE.TRUE,
    ).length;
    const paidCourseCount = totalCourses - freeCourseCount;

    return {
      totalCourses,
      totalStudents,
      averagePrice,
      freeCourseCount,
      paidCourseCount,
    };
  }

  /**
   * 获取课程市场筛选项
   */
  async getCourseMarketFilters(): Promise<CourseMarketFiltersResponseDto> {
    const courses = await this.courseRepository.find({
      select: ['categories', 'tags', 'difficulty'],
    });
    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    const difficultySet = new Set<string>();

    courses.forEach((course) => {
      course.categories?.forEach((category) => categorySet.add(category));
      course.tags?.forEach((tag) => tagSet.add(tag));
      if (course.difficulty) {
        difficultySet.add(course.difficulty);
      }
    });

    return {
      categories: Array.from(categorySet),
      tags: Array.from(tagSet),
      difficulties: Array.from(difficultySet),
    };
  }

  /**
   * 获取课程市场精选课程
   */
  async getFeaturedCourses(
    limit = 6,
  ): Promise<CourseHighlightResponseDto> {
    const courses = await this.courseRepository.find({
      order: { rating: 'DESC', reviewCount: 'DESC' },
      take: limit,
    });
    return { items: this.buildCourseHighlightItems(courses) };
  }

  /**
   * 获取热门课程
   */
  async getTrendingCourses(
    limit = 6,
  ): Promise<CourseHighlightResponseDto> {
    const courses = await this.courseRepository.find({
      order: { studentCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
    return { items: this.buildCourseHighlightItems(courses) };
  }

  /**
   * 获取讲师中心概览
   */
  async getInstructorDashboard(
    walletAddress: string,
  ): Promise<InstructorDashboardResponseDto> {
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const courses = await this.courseRepository.find({
      where: { instructorWallet: walletAddress },
      order: { updatedAt: 'DESC' },
    });

    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.studentCount || 0),
      0,
    );
    const estimatedTotalRevenue = courses.reduce((sum, course) => {
      const price = this.parsePrice(course.price);
      return sum + price * (course.studentCount || 0);
    }, 0);

    const averageRating =
      totalCourses > 0
        ? Number(
            (
              courses.reduce(
                (sum, course) => sum + (course.rating || 0),
                0,
              ) / totalCourses
            ).toFixed(2),
          )
        : 0;

    const recentCourses = courses.slice(0, 5).map((course) => ({
      courseId: course.courseId,
      title: course.title,
      rating: course.rating,
      status: course.status,
      studentCount: course.studentCount,
      revenue:
        this.parsePrice(course.price) * (course.studentCount || 0),
      updatedAt: course.updatedAt,
    }));

    return {
      walletAddress,
      totalCourses,
      totalStudents,
      averageRating,
      estimatedTotalRevenue: Number(estimatedTotalRevenue.toFixed(2)),
      recentCourses,
    };
  }

  private buildCourseHighlightItems(
    courses: Course[],
  ): CourseHighlightItemDto[] {
    return courses.map((course) => ({
      courseId: course.courseId,
      title: course.title,
      cover: course.cover,
      categories: course.categories || [],
      tags: course.tags || [],
      rating: course.rating,
      studentCount: course.studentCount,
      price: course.price,
      isFree: course.isFree,
    }));
  }

  private parsePrice(price: string | number | null | undefined): number {
    if (price === null || price === undefined) {
      return 0;
    }
    if (typeof price === 'number') {
      return price;
    }
    const parsed = parseFloat(price);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
