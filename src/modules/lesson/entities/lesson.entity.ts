import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Lesson extends CommonEntity {
  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // 课时顺序
  @Column()
  order: number;

  // 课时时长（分钟）
  @Column()
  duration: number;

  // 是否免费
  @Column({ default: false })
  isFree: boolean;

  // 视频URL（IPFS链接）
  @Column({ nullable: true })
  videoUrl?: string;

  // 视频CID（IPFS内容标识符）
  @Column({ nullable: true })
  videoCid?: string;

  // 课时状态
  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  // 课时类型
  @Column({ type: 'enum', enum: ['video', 'text', 'quiz', 'assignment'], default: 'video' })
  type: 'video' | 'text' | 'quiz' | 'assignment';

  // 课时内容（文本内容或题目）
  @Column({ type: 'text', nullable: true })
  content?: string;

  // 附件资源 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  // 学习目标 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  objectives?: string[];

  // 前置条件 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  prerequisites?: number[];

  // 是否必须完成
  @Column({ default: true })
  isRequired: boolean;

  // 允许重试次数
  @Column({ default: 0 })
  retryLimit: number;

  // 通过分数（百分比）
  @Column({ default: 0 })
  passingScore: number;

  // 课时资源
  @Column({ type: 'simple-json', nullable: true })
  resources?: {
    slides?: string[];
    documents?: string[];
    code?: string[];
    links?: string[];
  };
}
