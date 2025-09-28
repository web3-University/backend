import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Lesson } from './lesson.entity';

/**
 * 用户章节学习进度实体
 * 关联表设计，存储用户与章节的详细学习记录
 */
@Entity()
@Index(['userId', 'lessonId'], { unique: true }) // 确保用户-章节组合唯一
@Index(['userId', 'courseId']) // 按用户和课程查询优化
export class UserLessonProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户ID
  @Column()
  userId: number;

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
    default: 'not_started'
  })
  status: 'not_started' | 'watching' | 'completed';

  // 关联用户
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // 关联章节
  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
}
