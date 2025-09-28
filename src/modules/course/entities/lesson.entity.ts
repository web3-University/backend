import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

/**
 * 章节实体 - 单个课程章节
 * 属于某个课程的具体章节内容
 */
@Entity()
export class Lesson extends CommonEntity {
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
    default: 'video' 
  })
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live';

  // 是否免费预览
  @Column({ default: false })
  isPreview: boolean;

  // 章节状态
  @Column({ 
    type: 'enum', 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  })
  status: 'draft' | 'published' | 'archived';

  // 附件资源
  @Column({ type: 'json', nullable: true })
  attachments?: string[]; // IPFS链接数组

  // 学习目标
  @Column({ type: 'json', nullable: true })
  objectives?: string[];

  // 前置条件
  @Column({ type: 'json', nullable: true })
  prerequisites?: number[]; // 前置章节ID数组

  // 关联的课程
  @Column()
  courseId: number;

  @ManyToOne(() => Course, course => course.id)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  // 讲师钱包地址（冗余字段，提高查询效率）
  @Column()
  instructorWallet: string;

  // 章节标签
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  // 观看次数
  @Column({ default: 0 })
  viewCount: number;

  // 完成次数
  @Column({ default: 0 })
  completionCount: number;
}
