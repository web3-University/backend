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
import { Lesson } from './lesson.entity';

/**
 * 用户章节学习进度实体
 * 关联表设计，存储用户与章节的详细学习记录
 */
@Entity('user_lesson_progress')
@Index(['walletAddress', 'lessonId'], { unique: true }) // 确保用户-章节组合唯一
export class UserLessonProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户钱包地址
  @Column()
  walletAddress: string;

  // 章节ID
  @Column()
  lessonId: number;

  // 课程ID
  @Column()
  courseId: number;

  // 是否完成章节
  @Column({ default: false })
  isCompleted: boolean;

  // 完成时间
  @Column({ nullable: true })
  completedAt?: Date;

  // 观看时长（秒）
  @Column({ default: 0 })
  watchTime: number;

  // 章节总时长（秒）
  @Column({ default: 0 })
  totalDuration: number;

  // 观看进度百分比 (0-100)
  @Column({ default: 0 })
  watchProgress: number;

  // 最后观看时间
  @Column({ nullable: true })
  lastWatchAt?: Date;

  // 观看次数
  @Column({ default: 0 })
  watchCount: number;

  // 开始观看时间
  @Column({ nullable: true })
  startedAt?: Date;

  // 学习状态
  @Column({
    type: 'enum',
    enum: ['not_started', 'watching', 'completed'],
    default: 'not_started',
  })
  status: 'not_started' | 'watching' | 'completed';

  // 关联用户
  @ManyToOne(() => User, (user) => user.lessonProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletAddress', referencedColumnName: 'walletAddress' })
  user: User;

  // 关联章节
  @ManyToOne(() => Lesson, (lesson) => lesson.userProgresses)
  @JoinColumn({ name: 'lessonId', referencedColumnName: 'lessonId' })
  lesson: Lesson;
}
