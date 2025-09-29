import { CommonEntity } from 'src/common/entities/Common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { UserLessonProgress } from './user-lesson.entity';

/**
 * 章节实体 - 单个课程章节
 * 属于某个课程的具体章节内容
 */
@Entity()
export class Lesson extends CommonEntity {
  @PrimaryGeneratedColumn()
  lessonId: number;

  // 基本信息
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // 章节内容
  @Column({ type: 'text', nullable: true })
  content?: string; // 章节文本内容

  // 视频链接（IPFS）
  @Column({ nullable: true })
  videoUrl?: string;

  // 视频时长（秒）
  @Column({ default: 0 })
  duration: number;

  // 章节顺序
  @Column()
  order: number;

  // 章节类型
  @Column({
    type: 'enum',
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
    default: 'video',
  })
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live';

  // 是否免费预览
  @Column({ default: false })
  isFreePreview: boolean;

  // 章节状态
  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: 'draft' | 'published' | 'archived';

  // 附件资源
  @Column({ type: 'json', nullable: true })
  attachments?: string[]; // IPFS链接数组

  // 关联的课程
  @Column()
  courseId: number;

  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  // 关联关系 - 级联删除配置
  // 用户章节学习进度
  @OneToMany(() => UserLessonProgress, (progress) => progress.lesson, {
    cascade: true,
  })
  userProgresses: UserLessonProgress[];
}
