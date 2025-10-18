import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserCourseProgress } from '../course/entities/user-course.entity';
import { Course } from '../course/entities/course.entity';
import { LEARNING_STATUS } from '../../config/constant';
import { LearningStatsResponseDto } from './dto/learning-stats-response.dto';
import { UserLessonProgress } from '../course/entities/user-lesson.entity';
import { LearningOverviewResponseDto } from './dto/learning-overview-response.dto';
import { WeeklyProgressResponseDto } from './dto/weekly-progress-response.dto';
import { AchievementResponseDto } from './dto/achievement-response.dto';
import { RecentActivityResponseDto } from './dto/recent-activity-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

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
    @InjectRepository(UserLessonProgress)
    private userLessonProgressRepository: Repository<UserLessonProgress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
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
      where: { walletAddress, id: courseId },
    });

    if (existingProgress && existingProgress.isPurchased) {
      throw new Error('用户已经购买过此课程');
    }

    // 创建或更新购买记录
    const progressData = {
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

  /**
   * 获取用户学习统计信息
   */
  async getLearningStats(
    walletAddress: string,
  ): Promise<LearningStatsResponseDto> {
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const progressRecords = await this.userCourseProgressRepository.find({
      where: { walletAddress },
    });

    if (progressRecords.length === 0) {
      return {
        walletAddress,
        totalCourses: 0,
        purchasedCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        notStartedCount: 0,
        lastActivityAt: null,
      };
    }

    const purchasedCount = progressRecords.filter(
      (record) => record.isPurchased,
    ).length;
    const inProgressCount = progressRecords.filter(
      (record) => record.status === LEARNING_STATUS.IN_PROGRESS,
    ).length;
    const completedCount = progressRecords.filter(
      (record) => record.status === LEARNING_STATUS.COMPLETED,
    ).length;
    const notStartedCount = progressRecords.filter(
      (record) => record.status === LEARNING_STATUS.NOT_STARTED,
    ).length;

    const lastActivityAt = progressRecords.reduce<Date | null>(
      (latest, record) => {
        if (!latest) {
          return record.updatedAt;
        }
        return record.updatedAt > latest ? record.updatedAt : latest;
      },
      null,
    );

    return {
      walletAddress,
      totalCourses: progressRecords.length,
      purchasedCount,
      inProgressCount,
      completedCount,
      notStartedCount,
      lastActivityAt,
    };
  }

  /**
   * 清除所有用户数据（级联删除）
   * 利用实体级联删除配置，自动处理外键依赖
   */
  async clearAllUsers(): Promise<{ message: string }> {
    try {
      // 使用级联删除，只需要删除用户记录
      // TypeORM会自动处理所有相关的子记录删除
      await this.userRepository.clear();
      console.log('✅ 所有用户数据已成功清除（级联删除）');

      return { message: '所有用户数据已成功清除（级联删除）' };
    } catch (error) {
      console.error('❌ 清除用户数据时发生错误:', error);
      throw new Error(`清除用户数据失败: ${error.message}`);
    }
  }

  /**
   * 获取学习概览统计（学习中心头部区域）
   */
  async getLearningOverview(
    walletAddress: string,
  ): Promise<LearningOverviewResponseDto> {
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const progressRecords = await this.userCourseProgressRepository.find({
      where: { walletAddress },
    });

    const purchasedCount = progressRecords.filter(
      (record) => record.isPurchased,
    ).length;
    const completedCount = progressRecords.filter(
      (record) => record.status === LEARNING_STATUS.COMPLETED,
    ).length;
    const activeCount = progressRecords.filter(
      (record) =>
        record.status === LEARNING_STATUS.IN_PROGRESS ||
        record.status === LEARNING_STATUS.NOT_STARTED,
    ).length;

    const lessonProgresses =
      await this.userLessonProgressRepository.find({
        where: { walletAddress },
      });
    const streakDays = this.calculateLearningStreak(lessonProgresses);

    return {
      walletAddress,
      activeCourses: activeCount,
      completedCourses: completedCount,
      purchasedCourses: purchasedCount,
      streakDays,
      learnerLevel: this.deriveLearnerLevel(completedCount),
      ydBalance: user.ydBalance || '0',
    };
  }

  /**
   * 获取周学习进度概览
   */
  async getWeeklyProgress(
    walletAddress: string,
  ): Promise<WeeklyProgressResponseDto> {
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const lessonProgresses =
      await this.userLessonProgressRepository.find({
        where: { walletAddress },
      });

    const targetHours: number = 10; // 默认每周目标
    const { actualHours, dailyBreakdown } =
      this.calculateWeeklyHours(lessonProgresses);

    const completionRate =
      targetHours === 0
        ? 0
        : Math.min(100, Number(((actualHours / targetHours) * 100).toFixed(2)));

    return {
      walletAddress,
      targetHours,
      actualHours: Number(actualHours.toFixed(2)),
      completionRate,
      dailyBreakdown,
    };
  }

  /**
   * 获取成就列表
   */
  async getAchievements(
    walletAddress: string,
  ): Promise<AchievementResponseDto> {
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const courseProgresses =
      await this.userCourseProgressRepository.find({
        where: { walletAddress },
      });
    const lessonProgresses =
      await this.userLessonProgressRepository.find({
        where: { walletAddress },
      });

    const completedCount = courseProgresses.filter(
      (record) => record.status === LEARNING_STATUS.COMPLETED,
    ).length;
    const streak = this.calculateLearningStreak(lessonProgresses);
    const weekly = this.calculateWeeklyHours(lessonProgresses);

    const achievements = [
      {
        code: 'first_purchase',
        title: '首次迈出一步',
        description: '购买你的第一门课程',
        achieved: courseProgresses.some((record) => record.isPurchased),
        achievedAt:
          courseProgresses.find((record) => record.isPurchased)?.purchasedAt ??
          null,
        progress: courseProgresses.some((record) => record.isPurchased)
          ? 1
          : 0,
      },
      {
        code: 'course_master',
        title: '黄金学者',
        description: '完成 10 门课程',
        achieved: completedCount >= 10,
        achievedAt:
          courseProgresses
            .filter(
              (record) => record.status === LEARNING_STATUS.COMPLETED,
            )
            .sort(
              (a, b) =>
                (a.updatedAt?.getTime() ?? 0) -
                (b.updatedAt?.getTime() ?? 0),
            )[9]?.updatedAt ?? null,
        progress: Math.min(1, completedCount / 10),
      },
      {
        code: 'streak_master',
        title: '坚持不懈',
        description: '连续学习 7 天',
        achieved: streak >= 7,
        achievedAt:
          this.getDateFromStreak(lessonProgresses, 7) ?? null,
        progress: Math.min(1, streak / 7),
      },
      {
        code: 'weekly_warrior',
        title: '学习达人',
        description: '本周累计学习 5 小时',
        achieved: weekly.actualHours >= 5,
        achievedAt: weekly.lastActiveDate,
        progress: Math.min(1, weekly.actualHours / 5),
      },
    ];

    return {
      walletAddress,
      achievements,
    };
  }

  /**
   * 获取最近学习记录
   */
  async getRecentActivities(
    walletAddress: string,
  ): Promise<RecentActivityResponseDto> {
    const user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const activities = await this.userLessonProgressRepository.find({
      where: { walletAddress },
      order: { updatedAt: 'DESC' },
      take: 6,
      relations: ['lesson', 'lesson.course'],
    });

    return {
      walletAddress,
      activities: activities.map((activity) => ({
        courseId: activity.courseId,
        courseTitle: activity.lesson?.course?.title ?? '未命名课程',
        lessonId: activity.lessonId,
        lessonTitle: activity.lesson?.title ?? '未命名章节',
        status: activity.status,
        watchProgress: activity.watchProgress,
        lastWatchAt:
          activity.lastWatchAt ??
          activity.completedAt ??
          activity.updatedAt ??
          null,
      })),
    };
  }

  /**
   * 计算连续学习天数
   */
  private calculateLearningStreak(
    lessonProgresses: UserLessonProgress[],
  ): number {
    if (!lessonProgresses.length) {
      return 0;
    }

    const activeDateSet = new Set<string>();
    lessonProgresses.forEach((progress) => {
      const date =
        progress.lastWatchAt ??
        progress.completedAt ??
        progress.updatedAt;
      if (date) {
        activeDateSet.add(this.getDateKey(date));
      }
    });

    let streak = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    while (activeDateSet.has(this.getDateKey(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  }

  /**
   * 根据完成课程数量计算学习等级
   */
  private deriveLearnerLevel(completedCourses: number): string {
    if (completedCourses >= 15) {
      return '铂金学者';
    }
    if (completedCourses >= 10) {
      return '黄金学者';
    }
    if (completedCourses >= 5) {
      return '白银学者';
    }
    if (completedCourses >= 1) {
      return '青铜学者';
    }
    return '新锐学员';
  }

  /**
   * 计算最近七天学习时长
   */
  private calculateWeeklyHours(
    lessonProgresses: UserLessonProgress[],
  ): {
    actualHours: number;
    dailyBreakdown: { date: string; hours: number }[];
    lastActiveDate: Date | null;
  } {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dailyMap = new Map<string, number>();
    let lastActiveDate: Date | null = null;

    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(now);
      date.setDate(now.getDate() - offset);
      dailyMap.set(this.getDateKey(date), 0);
    }

    lessonProgresses.forEach((progress) => {
      const referenceDate =
        progress.lastWatchAt ??
        progress.completedAt ??
        progress.updatedAt;
      if (!referenceDate) {
        return;
      }

      const dateKey = this.getDateKey(referenceDate);
      if (!dailyMap.has(dateKey)) {
        return;
      }

      const hours = Math.min(
        progress.watchTime,
        progress.totalDuration || progress.watchTime,
      ) / 3600;
      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + hours);

      if (
        !lastActiveDate ||
        referenceDate.getTime() > lastActiveDate.getTime()
      ) {
        lastActiveDate = referenceDate;
      }
    });

    const dailyBreakdown = Array.from(dailyMap.entries())
      .sort(([dateA], [dateB]) => (dateA > dateB ? 1 : -1))
      .map(([date, hours]) => ({
        date,
        hours: Number(hours.toFixed(2)),
      }));

    const actualHours = dailyBreakdown.reduce(
      (sum, day) => sum + day.hours,
      0,
    );

    return { actualHours, dailyBreakdown, lastActiveDate };
  }

  /**
   * 获取指定连续天数成就的达成时间
   */
  private getDateFromStreak(
    lessonProgresses: UserLessonProgress[],
    targetStreak: number,
  ): Date | null {
    if (targetStreak <= 0 || !lessonProgresses.length) {
      return null;
    }

    const activeDates = lessonProgresses
      .map(
        (progress) =>
          progress.lastWatchAt ??
          progress.completedAt ??
          progress.updatedAt,
      )
      .filter((date): date is Date => !!date)
      .map((date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    if (!activeDates.length) {
      return null;
    }

    let streak = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const prev = activeDates[i - 1];
      const current = activeDates[i];

      const diffDays = Math.round(
        (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streak += 1;
        if (streak >= targetStreak) {
          return current;
        }
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    return null;
  }

  /**
   * 生成日期key，格式 YYYY-MM-DD
   */
  private getDateKey(date: Date): string {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    const year = normalized.getFullYear();
    const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
    const day = `${normalized.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
