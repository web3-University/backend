import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCourseProgress } from '../course/entities/user-course.entity';
import { Course } from '../course/entities/course.entity';
import { LEARNING_STATUS } from '../../config/constant';
import { RequestEmailCodeDto } from './dto/request-email-code.dto';
import { EmailVerification } from './entities/email-verification.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../email/email.service';

/**
 * 用户服务类
 * 处理用户相关的业务逻辑（使用模拟数据）
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCourseProgress)
    private userCourseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 创建新用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * 根据钱包地址获取用户
   */
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { walletAddress },
    });
  }

  /**
   * 请求发送邮箱验证码
   */
  async requestEmailVerificationCode(
    requestEmailCodeDto: RequestEmailCodeDto,
  ): Promise<void> {
    const { walletAddress, email } = requestEmailCodeDto;
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户 ${walletAddress} 不存在`);
    }

    const latestCode = await this.emailVerificationRepository.findOne({
      where: { walletAddress, email },
      order: { createdAt: 'DESC' },
    });

    if (
      latestCode &&
      !latestCode.used &&
      latestCode.expiresAt.getTime() > Date.now() &&
      Date.now() - latestCode.createdAt.getTime() < 60 * 1000
    ) {
      throw new BadRequestException('验证码已发送，请稍后再试');
    }

    const code = Math.floor(1000 + Math.random() * 9000)
      .toString()
      .padStart(4, '0');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.emailVerificationRepository.save({
      walletAddress,
      email,
      code,
      expiresAt,
      used: false,
    });

    await this.emailService.sendVerificationCodeEmail(
      email,
      code,
      user.username,
      user.walletAddress,
    );
  }

  /**
   * 更新用户资料
   */
  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<User> {
    const { walletAddress, username, avatar, email, verificationCode } =
      updateProfileDto;

    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户 ${walletAddress} 不存在`);
    }

    const verificationRecord = await this.emailVerificationRepository.findOne({
      where: {
        walletAddress,
        email,
        code: verificationCode,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationRecord) {
      throw new BadRequestException('验证码无效，请重新获取');
    }

    if (verificationRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    user.username = username;
    user.email = email;
    user.avatar = avatar;

    const updatedUser = await this.userRepository.save(user);

    verificationRecord.used = true;
    await this.emailVerificationRepository.save(verificationRecord);

    return updatedUser;
  }

  /**
   * 用户购买课程
   */
  async purchaseCourse(
    walletAddress: string,
    courseId: number,
    transactionHash: string,
    amount: string,
  ): Promise<UserCourseProgress> {
    // 检查用户是否存在
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new Error(`用户 ${walletAddress} 不存在`);
    }

    // 检查课程是否存在
    const course = await this.courseRepository.findOne({
      where: { courseId: courseId },
    });
    if (!course) {
      throw new Error(`课程 ${courseId} 不存在`);
    }

    // 检查是否已经购买过
    const existingProgress = await this.userCourseProgressRepository.findOne({
      where: { walletAddress, courseId },
    });

    if (existingProgress && existingProgress.isPurchased) {
      throw new Error('用户已经购买过此课程');
    }

    // 创建或更新购买记录
    const progressData = {
      userId: user.userId,
      walletAddress,
      courseId,
      isPurchased: true,
      purchasedAt: new Date(),
      purchaseAmount: amount,
      purchaseTransactionHash: transactionHash,
      status: LEARNING_STATUS.NOT_STARTED,
    };

    if (existingProgress) {
      // 更新现有记录
      Object.assign(existingProgress, progressData);
      return await this.userCourseProgressRepository.save(existingProgress);
    } else {
      // 创建新记录
      return await this.userCourseProgressRepository.save(progressData);
    }
  }

  /**
   * 获取用户购买的课程
   */
  async getUserPurchasedCourses(walletAddress: string): Promise<Course[]> {
    const progressRecords = await this.userCourseProgressRepository.find({
      where: { walletAddress, isPurchased: true },
      relations: ['course'],
    });

    return progressRecords.map((record) => record.course);
  }

  /**
   * 获取用户正在学习的课程
   */
  async getUserLearningCourses(walletAddress: string): Promise<Course[]> {
    const progressRecords = await this.userCourseProgressRepository.find({
      where: {
        walletAddress,
        isPurchased: true,
        status: LEARNING_STATUS.IN_PROGRESS,
      },
      relations: ['course'],
    });

    return progressRecords.map((record) => record.course);
  }

  /**
   * 获取用户已完成的课程
   */
  async getUserCompletedCourses(walletAddress: string): Promise<Course[]> {
    const progressRecords = await this.userCourseProgressRepository.find({
      where: {
        walletAddress,
        isPurchased: true,
        status: LEARNING_STATUS.COMPLETED,
      },
      relations: ['course'],
    });

    return progressRecords.map((record) => record.course);
  }
}
