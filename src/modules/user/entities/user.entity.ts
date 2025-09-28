import { Entity, Column } from 'typeorm';
import { CommonEntity } from 'src/common/entities/Common.entity';

@Entity()
export class User extends CommonEntity {
  // Web3核心字段 - 钱包地址作为主要标识符
  @Column({ unique: true })
  walletAddress: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email?: string;

  // 头像存储在IPFS上
  @Column({ nullable: true })
  avatar?: string;

  // // 用户角色：学生、讲师、管理员
  // @Column({
  //   type: 'enum',
  //   enum: ['student', 'instructor', 'admin'],
  //   default: 'student',
  // })
  // role: 'student' | 'instructor' | 'admin';

  // 学习统计信息（学生相关）
  @Column({ default: 0 })
  totalCourses: number;

  @Column({ default: 0 })
  completedCourses: number;

  @Column({ default: 0 })
  totalLessons: number;

  @Column({ default: 0 })
  completedLessons: number;

  @Column({ default: 0 })
  studyHours: number;

  // NFT证书数量
  @Column({ default: 0 })
  nftCertificates: number;

  // 讲师相关字段（当role为instructor时使用）
  @Column({ type: 'text', nullable: true })
  bio?: string;

  // 专业领域，多选 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  specializations?: string[];

  // 讲师评分
  @Column({ type: 'float', default: 0 })
  rating: number;

  // 讲师的学生总数
  @Column({ default: 0 })
  totalStudents: number;

  // 讲师创建的课程总数
  @Column({ default: 0 })
  instructorCourses: number;

  // 是否完成讲师注册
  @Column({ default: false })
  isInstructorRegistered: boolean;

  // 是否通过讲师审核
  @Column({ default: false })
  isInstructorApproved: boolean;
}