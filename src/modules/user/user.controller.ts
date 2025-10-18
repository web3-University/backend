import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserCourseProgress } from '../course/entities/user-course.entity';
import { Course } from '../course/entities/course.entity';
import { LearningStatsResponseDto } from './dto/learning-stats-response.dto';
import { LearningOverviewResponseDto } from './dto/learning-overview-response.dto';
import { WeeklyProgressResponseDto } from './dto/weekly-progress-response.dto';
import { AchievementResponseDto } from './dto/achievement-response.dto';
import { RecentActivityResponseDto } from './dto/recent-activity-response.dto';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 注册新用户
   */
  @Post('register')
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 200, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * 获取所有用户
   */
  @Get('list')
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // 通过钱包地址获取用户
  @Get('walletAddress')
  @ApiOperation({ summary: '通过钱包地址获取用户' })
  @ApiQuery({ name: 'walletAddress', description: '钱包地址' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @ApiResponse({ status: 500, description: '用户不存在' })
  findByWalletAddress(
    @Query('walletAddress') walletAddress: string,
  ): Promise<User | null> {
    return this.userService.findByWalletAddress(walletAddress);
  }

  // 清除所有用户
  @Post('clearAllUsers')
  @ApiOperation({ summary: '清除所有用户' })
  @ApiResponse({ status: 200, description: '清除用户成功' })
  clearAllUsers(): Promise<{ message: string }> {
    return this.userService.clearAllUsers();
  }

  // 用户购买课程
  @Post('purchaseCourse')
  @ApiOperation({ summary: '用户购买课程' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', description: '用户钱包地址' },
        courseId: { type: 'number', description: '课程ID' },
        transactionHash: { type: 'string', description: '交易哈希' },
        amount: { type: 'string', description: '购买金额（YD币）' },
      },
      required: ['walletAddress', 'courseId', 'transactionHash', 'amount'],
    },
  })
  @ApiResponse({ status: 200, description: '购买成功' })
  @ApiResponse({ status: 400, description: '购买失败' })
  purchaseCourse(
    @Body('walletAddress') walletAddress: string,
    @Body('courseId') courseId: number,
    @Body('transactionHash') transactionHash: string,
    @Body('amount') amount: string,
  ): Promise<UserCourseProgress> {
    return this.userService.purchaseCourse(
      walletAddress,
      courseId,
      transactionHash,
      amount,
    );
  }

  // 获取用户购买的课程
  @Get('purchasedCourses')
  @ApiOperation({ summary: '获取用户购买的课程' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getUserPurchasedCourses(
    @Query('walletAddress') walletAddress: string,
  ): Promise<Course[]> {
    return this.userService.getUserPurchasedCourses(walletAddress);
  }

  // 获取用户正在学习的课程
  @Get('learningCourses')
  @ApiOperation({ summary: '获取用户正在学习的课程' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getUserLearningCourses(
    @Query('walletAddress') walletAddress: string,
  ): Promise<Course[]> {
    return this.userService.getUserLearningCourses(walletAddress);
  }

  // 获取用户已完成的课程
  @Get('completedCourses')
  @ApiOperation({ summary: '获取用户已完成的课程' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getUserCompletedCourses(
    @Query('walletAddress') walletAddress: string,
  ): Promise<Course[]> {
    return this.userService.getUserCompletedCourses(walletAddress);
  }

  // 获取用户学习统计
  @Get('learningStats')
  @ApiOperation({ summary: '获取用户学习统计概览' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({
    status: 200,
    description: '统计获取成功',
    type: LearningStatsResponseDto,
  })
  getLearningStats(
    @Query('walletAddress') walletAddress: string,
  ): Promise<LearningStatsResponseDto> {
    return this.userService.getLearningStats(walletAddress);
  }

  // 学习概览
  @Get('learningOverview')
  @ApiOperation({ summary: '学习概览统计测试' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({
    status: 200,
    description: '学习概览获取成功',
    type: LearningOverviewResponseDto,
  })
  getLearningOverview(
    @Query('walletAddress') walletAddress: string,
  ): Promise<LearningOverviewResponseDto> {
    return this.userService.getLearningOverview(walletAddress);
  }

  // 周学习进度
  @Get('weeklyProgress')
  @ApiOperation({ summary: '周学习进度统计测试' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({
    status: 200,
    description: '周学习进度获取成功',
    type: WeeklyProgressResponseDto,
  })
  getWeeklyProgress(
    @Query('walletAddress') walletAddress: string,
  ): Promise<WeeklyProgressResponseDto> {
    return this.userService.getWeeklyProgress(walletAddress);
  }

  // 成就中心
  @Get('achievements')
  @ApiOperation({ summary: '学习成就列表测试' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({
    status: 200,
    description: '成就列表获取成功',
    type: AchievementResponseDto,
  })
  getAchievements(
    @Query('walletAddress') walletAddress: string,
  ): Promise<AchievementResponseDto> {
    return this.userService.getAchievements(walletAddress);
  }

  // 最近学习记录
  @Get('recentActivities')
  @ApiOperation({ summary: '最近学习记录测试' })
  @ApiQuery({ name: 'walletAddress', description: '用户钱包地址' })
  @ApiResponse({
    status: 200,
    description: '最近学习记录获取成功',
    type: RecentActivityResponseDto,
  })
  getRecentActivities(
    @Query('walletAddress') walletAddress: string,
  ): Promise<RecentActivityResponseDto> {
    return this.userService.getRecentActivities(walletAddress);
  }
}
