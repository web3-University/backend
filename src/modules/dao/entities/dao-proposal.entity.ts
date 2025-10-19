import { CommonEntity } from 'src/common/entities/Common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';

/**
 * DAO 提案实体
 * 记录课程质量投票提案信息
 */
@Entity('dao_proposals')
@Index(['courseId', 'status']) // 课程状态查询优化
@Index(['proposerWallet']) // 提案人查询优化
@Index(['status', 'votingEndTime']) // 状态和时间查询优化
export class DAOProposal extends CommonEntity {
  @PrimaryGeneratedColumn()
  proposalId: number;

  // 课程ID
  @Column()
  courseId: number;

  // 提案人钱包地址
  @Column()
  proposerWallet: string;

  // 发起原因/描述
  @Column({ type: 'text' })
  reason: string;

  // 提案押金（YD币数量）
  @Column({ type: 'varchar', length: 50 })
  proposalDeposit: string;

  // 投票开始时间
  @Column()
  votingStartTime: Date;

  // 投票结束时间
  @Column()
  votingEndTime: Date;

  // 支持票数（支持课程质量好）
  @Column({ type: 'varchar', length: 50, default: '0' })
  forVotes: string;

  // 反对票数（反对课程质量差）
  @Column({ type: 'varchar', length: 50, default: '0' })
  againstVotes: string;

  // 总投票权重
  @Column({ type: 'varchar', length: 50, default: '0' })
  totalVotingPower: string;

  // 提案状态
  @Column({
    type: 'enum',
    enum: ['Active', 'Succeeded', 'Failed', 'Canceled', 'Executed'],
    default: 'Active',
  })
  status: string;

  // 是否已执行
  @Column({ default: false })
  executed: boolean;

  // 执行时间
  @Column({ nullable: true })
  executedAt?: Date;

  // 链上交易哈希
  @Column({ nullable: true })
  transactionHash?: string;

  // 关联的课程
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  // 关联的投票记录 - 使用字符串引用避免循环依赖
  @OneToMany('DAOVote', 'proposal', { cascade: true })
  votes: any[];

  // 计算法定人数
  get quorumRequired(): number {
    if (!this.course?.userProgresses) return 0;

    const studentCount = this.course.userProgresses.filter(
      (p) => p.isPurchased,
    ).length;

    const quorumPercentage = 1000; // 10% (1000/10000)
    const minVotingPower = 100; // 100 YD

    return Math.max((studentCount * quorumPercentage) / 10000, minVotingPower);
  }

  // 计算反对票占比
  get againstVotePercentage(): number {
    const total = parseFloat(this.totalVotingPower);
    if (total === 0) return 0;

    const against = parseFloat(this.againstVotes);
    return (against / total) * 100;
  }

  // 检查是否达到法定人数
  get hasReachedQuorum(): boolean {
    return parseFloat(this.totalVotingPower) >= this.quorumRequired;
  }

  // 检查是否通过（反对票占比 >= 50%）
  get isPassed(): boolean {
    return this.againstVotePercentage >= 50;
  }

  // 检查是否可以投票
  get canVote(): boolean {
    const now = new Date();
    return (
      this.status === 'Active' &&
      now >= this.votingStartTime &&
      now <= this.votingEndTime
    );
  }

  // 检查是否可以执行
  get canExecute(): boolean {
    return this.status === 'Succeeded' && !this.executed;
  }
}
