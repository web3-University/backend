import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Lesson } from './lesson.entity';
import { COURSE_DIFFICULTY, COURSE_STATUS, IS_FREE } from 'src/config/constant';

/**
 * 课程实体 - 课程系列/集合
 * 包含多个章节的完整课程
 */
@Entity()
export class Course extends CommonEntity {
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

  // 课程分类和难度
  @Column({ type: 'json' })
  categories: string[]; // 如 "区块链基础"

  @Column({ default: COURSE_DIFFICULTY.BEGINNER })
  difficulty: string;

  // 价格信息
  @Column({ type: 'varchar', length: 50, default: '0' })
  price: string; // YD币价格，使用字符串存储大数

  // 课程时长和统计
  @Column({ default: 0 })
  duration: number; // 总时长（分钟）

  @Column({ default: 0 })
  studentCount: number; // 学生数量

  @Column({ default: 0 })
  lessonCount: number; // 课时数量

  // 评分和评价
  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number; // 评价数量

  // 课程状态 草稿 等待审核 已发布 已拒绝
  @Column({ default: COURSE_STATUS.DRAFT })
  status: string;

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

  // Web3相关
  @Column({ nullable: true })
  nftContract?: string; // NFT证书合约地址

  // 预计学习时间
  @Column({ default: 0 })
  estimatedHours: number; // 预计学习小时数

  // 关联关系 - 一个课程包含多个章节
  @OneToMany(() => Lesson, lesson => lesson.course)
  lessons: Lesson[];
}