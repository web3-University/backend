
import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Course extends CommonEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  // 讲师钱包地址
  @Column()
  instructorWallet: string;

  // 讲师用户名（冗余字段，提高查询效率）
  @Column()
  instructorName: string;

  // 课程分类
  @Column({type: 'simple-array'})
  category: string[];

  // 课程等级
  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] })
  level: 'beginner' | 'intermediate' | 'advanced';

  // YD币价格（使用字符串存储大数）
  @Column({ type: 'varchar', length: 50 })
  price: string;

  // 课程时长（分钟）
  @Column()
  duration: number;

  // 课程缩略图（IPFS链接）
  @Column({ nullable: true })
  thumbnail?: string;

  // 课程标签
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  // 课程评分
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  // 学生数量
  @Column({ default: 0 })
  studentCount: number;

  // NFT合约地址
  @Column({ nullable: true })
  nftContract?: string;

  // 是否已发布
  @Column({ default: false })
  isPublished: boolean;

  // 是否免费
  @Column({ default: false })
  isFree: boolean;

  // 课程状态
  @Column({ type: 'enum', enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' })
  status: 'draft' | 'pending' | 'approved' | 'rejected';

  // 课程难度评分
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  difficulty: number;

  // 预计学习时间（小时）
  @Column({ default: 0 })
  estimatedHours: number;

  // 课程语言
  @Column({ default: 'zh-CN' })
  language: string;

  // 课程资源,有 video 或者 document
  @Column({ type: 'simple-json', nullable: true })
  resources: number[];
}