import { Entity, Column } from 'typeorm';
import { CommonEntity } from 'src/common/entities/Common.entity';

@Entity()
export class Teacher extends CommonEntity {
  // 讲师钱包地址
  @Column({ unique: true })
  walletAddress: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email?: string;

  // 头像存储在IPFS上
  @Column({ nullable: true })
  avatar?: string;

  // 讲师简介
  @Column({ type: 'text', nullable: true })
  bio?: string;

  // 专业领域，多选 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  specializations?: string[];

  // 讲师评分
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  // 学生总数
  @Column({ default: 0 })
  totalStudents: number;

  // 课程总数
  @Column({ default: 0 })
  totalCourses: number;

  // 是否完成注册
  @Column({ default: false })
  isRegistered: boolean;

  // 是否通过审核
  @Column({ default: false })
  isApproved: boolean;

}