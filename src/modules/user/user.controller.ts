import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserCourseProgress } from '../course/entities/user-course.entity';
import { Course } from '../course/entities/course.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestEmailCodeDto } from './dto/request-email-code.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@ApiTags('用户管理')
// @UseGuards(JwtAuthGuard)
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

  @Post('profile/email-code')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  async requestEmailVerificationCode(
    @Body() requestEmailCodeDto: RequestEmailCodeDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.userService.requestEmailVerificationCode(requestEmailCodeDto);
    return { success: true, message: '验证码已发送' };
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  @ApiResponse({ status: 200, description: '用户资料更新成功', type: User })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.userService.updateProfile(updateProfileDto);
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
}
