import { CommonEntity } from 'src/common/entities/Common.entity';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { UserCourseProgress } from './user-course.entity';
import { NFTCertificate } from '../../certificate/entities/nft-certificate.entity';
import { User } from '../../user/entities/user.entity';
import {
  COURSE_DIFFICULTY,
  COURSE_STATUS,
  IS_FREE,
  LEARNING_STATUS,
} from 'src/config/constant';

/**
 * 课程实体 - 课程系列/集合
 * 包含多个章节的完整课程
 */
@Entity()
export class Course extends CommonEntity {
  @PrimaryGeneratedColumn()
  courseId: number;

  // 基本信息
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  // 课程封面（IPFS链接）
  @Column({ nullable: true })
  cover?: string;

  // 讲师钱包地址
  @Column()
  instructorWallet: string;

  // 讲师名称
  @Column({ nullable: true })
  instructorName: string;

  // 课程分类
  @Column({ type: 'json' })
  categories: string[]; // 如 "区块链基础"

  // 课程难度
  @Column({ default: COURSE_DIFFICULTY.BEGINNER })
  difficulty: string;

  // 价格信息
  @Column({ type: 'varchar', length: 50, default: '0' })
  price: string; // YD币价格，使用字符串存储大数

  // 课程时长
  @Column({ default: 0 })
  duration: number; // 总时长（分钟）

  // 评分和评价
  @Column({ type: 'float', default: 0 })
  rating: number;

  // 课程状态 草稿 等待审核 已发布 已拒绝
  @Column({ default: COURSE_STATUS.DRAFT })
  status: string;

  // 是否免费
  @Column({ default: IS_FREE.FALSE })
  isFree: string;

  // 课程标签
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  // 学习目标
  @Column({ type: 'json', nullable: true })
  learningObjectives?: string[];

  // 前置要求
  @Column({ type: 'json', nullable: true })
  prerequisites?: string[];

  // 关联关系
  // 讲师关系
  @ManyToOne(() => User, (user) => user.createdCourses)
  @JoinColumn({
    name: 'instructorWallet',
    referencedColumnName: 'walletAddress',
  })
  instructor: User;

  // 一个课程包含多个章节
  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Lesson[];

  // 用户课程学习进度
  @OneToMany(() => UserCourseProgress, (progress) => progress.course, {
    cascade: true,
  })
  userProgresses: UserCourseProgress[];

  // NFT证书记录
  @OneToMany(() => NFTCertificate, (certificate) => certificate.courseId)
  certificates: NFTCertificate[];

  // 获取购买此课程的用户
  get purchasedUsers(): User[] {
    return (
      this.userProgresses
        ?.filter((progress) => progress.isPurchased)
        ?.map((progress) => progress.user) || []
    );
  }

  // 获取完成此课程的用户
  get completedUsers(): User[] {
    return (
      this.userProgresses
        ?.filter(
          (progress) =>
            progress.isPurchased &&
            progress.status === LEARNING_STATUS.COMPLETED,
        )
        ?.map((progress) => progress.user) || []
    );
  }

  // 获取课程购买数量
  get purchaseCount(): number {
    return (
      this.userProgresses?.filter((progress) => progress.isPurchased).length ||
      0
    );
  }

  // 获取课程完成数量
  get completionCount(): number {
    return (
      this.userProgresses?.filter(
        (progress) =>
          progress.isPurchased && progress.status === LEARNING_STATUS.COMPLETED,
      ).length || 0
    );
  }

  // 获取课程课时数量（动态计算）
  get lessonCount(): number {
    return this.lessons?.length || 0;
  }

  // 获取课程学生数量（动态计算）
  get studentCount(): number {
    return this.purchasedUsers.length;
  }

  // 获取课程评价数量（动态计算）
  get reviewCount(): number {
    return (
      this.userProgresses?.filter(
        (progress) =>
          progress.userRating !== null && progress.userRating !== undefined,
      ).length || 0
    );
  }

  // 获取课程平均评分
  get averageRating(): number {
    const ratings =
      this.userProgresses
        ?.filter(
          (progress) =>
            progress.userRating !== null && progress.userRating !== undefined,
        )
        ?.map((progress) => progress.userRating!) || [];

    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  // 获取课程评价详情（谁评价了，评价了多少分）
  get reviewDetails(): Array<{
    walletAddress: string;
    rating: number;
    ratedAt: Date;
    username?: string;
  }> {
    return (
      this.userProgresses
        ?.filter(
          (progress) =>
            progress.userRating !== null && progress.userRating !== undefined,
        )
        ?.map((progress) => ({
          walletAddress: progress.walletAddress,
          rating: progress.userRating!,
          ratedAt: progress.ratedAt!,
          username: progress.user?.username,
        })) || []
    );
  }
}
