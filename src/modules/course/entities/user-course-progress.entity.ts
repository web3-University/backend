import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from './course.entity';

/**
 * 用户课程学习进度实体
 * 关联表设计，存储用户与课程的复杂关系
 */
@Entity()
export class UserCourseProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户钱包地址
  @Column()
  walletAddress: string;

  // 课程ID
  @Column()
  courseId: number;

  // 学习进度百分比 (0-100)
  @Column({ default: 0 })
  progress: number;

  // 是否完成课程
  @Column({ default: false })
  isCompleted: boolean;

  // 完成时间
  @Column({ nullable: true })
  completedAt?: Date;

  // 学习时长（分钟）
  @Column({ default: 0 })
  studyTime: number;

  // 最后学习时间
  @Column({ nullable: true })
  lastStudyAt?: Date;

  // 当前学习章节ID
  @Column({ nullable: true })
  currentLessonId?: number;

  // 学习状态
  @Column({ 
    type: 'enum', 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started' 
  })
  status: 'not_started' | 'in_progress' | 'completed';

  // 支付状态
  @Column({ default: false })
  isPaid: boolean;

  // 支付时间
  @Column({ nullable: true })
  paidAt?: Date;

  // 交易哈希（Web3支付）
  @Column({ nullable: true })
  transactionHash?: string;

  // 用户评分（1-5）
  @Column({ nullable: true })
  userRating?: number;

  // 评分时间
  @Column({ nullable: true })
  ratedAt?: Date;

  // 关联用户
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // 关联课程
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
