import { CommonEntity } from 'src/common/entities/Common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from './course.entity';
import { LEARNING_STATUS } from '../../../config/constant';

/**
 * 用户课程关系实体
 * 记录用户与课程的完整关系：购买、学习进度、评分等
 */
@Entity('user_course_progress')
@Index(['walletAddress', 'courseId'], { unique: true }) // 确保用户-课程组合唯一
export class UserCourseProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 课程ID
  @Column()
  courseId: number;

  // 用户钱包地址
  @Column()
  walletAddress: string;

  // 购买相关字段
  @Column({ default: false })
  isPurchased: boolean; // 是否已购买

  @Column({ nullable: true })
  purchasedAt?: Date; // 购买时间

  @Column({ type: 'varchar', length: 50, nullable: true })
  purchaseAmount?: string; // 购买金额（YD币）

  @Column({ nullable: true })
  purchaseTransactionHash?: string; // 购买交易哈希

  @Column({
    default: LEARNING_STATUS.NOT_STARTED,
  })
  status: string; // 学习状态

  // 评分字段
  @Column({ nullable: true })
  userRating?: number; // 用户评分（1-5）

  @Column({ nullable: true })
  ratedAt?: Date; // 评分时间

  // 关联用户
  @ManyToOne(() => User, (user) => user.courseProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletAddress', referencedColumnName: 'walletAddress' })
  user: User;

  // 关联课程
  @ManyToOne(() => Course, (course) => course.userProgresses)
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
}
