import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from 'src/common/entities/Common.entity';
import { UserCourseProgress } from '../../course/entities/user-course.entity';
import { UserLessonProgress } from '../../course/entities/user-lesson.entity';
import { NFTCertificate } from '../../certificate/entities/nft-certificate.entity';
import { Course } from '../../course/entities/course.entity';

@Entity()
export class User extends CommonEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  // Web3核心字段 - 钱包地址作为主要标识符
  @Column({ unique: false })
  walletAddress: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email?: string;

  // 头像存储在IPFS上
  @Column({ nullable: true })
  avatar?: string;

  // 讲师相关字段（当role为instructor时使用）
  @Column({ type: 'text', nullable: true })
  bio?: string;

  // 专业领域，多选 - 使用JSON存储
  @Column({ type: 'json', nullable: true })
  specializations?: string[];

  // 讲师评分
  @Column({ type: 'float', default: 0 })
  rating: number;

  // 是否完成讲师注册
  @Column({ default: false })
  isInstructorRegistered: boolean;

  // 是否通过讲师审核
  @Column({ default: false })
  isInstructorApproved: boolean;

  // 关联关系
  // 用户课程关系记录（包含购买和学习进度）
  @OneToMany(() => UserCourseProgress, (progress) => progress.user, {
    cascade: true,
  })
  courseProgresses: UserCourseProgress[];

  // 用户章节学习进度记录
  @OneToMany(() => UserLessonProgress, (progress) => progress.user, {
    cascade: true,
  })
  lessonProgresses: UserLessonProgress[];

  // NFT证书记录
  @OneToMany(() => NFTCertificate, (certificate) => certificate.user)
  certificates: NFTCertificate[];

  // 作为讲师创建的课程
  @OneToMany(() => Course, (course) => course.instructor, {
    cascade: true,
  })
  createdCourses: Course[];
}
