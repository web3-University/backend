import { CommonEntity } from 'src/common/entities/Common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
// import { DAOProposal } from './dao-proposal.entity'; // 避免循环依赖

/**
 * DAO 投票记录实体
 * 记录用户对提案的投票信息
 */
@Entity('dao_votes')
@Index(['proposalId', 'voterWallet'], { unique: true }) // 确保用户对同一提案只能投一次
@Index(['voterWallet']) // 用户投票查询优化
@Index(['proposalId']) // 提案投票查询优化
export class DAOVote extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 提案ID
  @Column()
  proposalId: number;

  // 投票人钱包地址
  @Column()
  voterWallet: string;

  // 投票选项 (0: For支持课程, 1: Against反对课程)
  @Column({ type: 'enum', enum: [0, 1] })
  option: number;

  // 投票权重（锁定的YD币数量）
  @Column({ type: 'varchar', length: 50 })
  votingPower: string;

  // 是否已领取奖励
  @Column({ default: false })
  rewardClaimed: boolean;

  // 奖励领取时间
  @Column({ nullable: true })
  claimedAt?: Date;

  // 链上交易哈希
  @Column({ nullable: true })
  transactionHash?: string;

  // 关联的提案 - 使用字符串引用避免循环依赖
  @ManyToOne('DAOProposal', 'votes', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'proposalId' })
  proposal: any;

  // 获取投票选项文本
  get optionText(): string {
    return this.option === 0 ? 'For' : 'Against';
  }

  // 检查是否在胜利方
  isWinner(proposal: any): boolean {
    if (proposal.status === 'Succeeded') {
      // 提案通过，Against方胜利
      return this.option === 1;
    } else if (proposal.status === 'Failed') {
      // 提案失败，For方胜利
      return this.option === 0;
    }
    return false;
  }

  // 计算奖励金额
  calculateReward(proposal: any): string {
    const votingPower = parseFloat(this.votingPower);

    if (this.isWinner(proposal)) {
      // 胜利方：本金 + 奖励池分成
      const totalRewardPool = this.calculateRewardPool(proposal);
      const winnerTotalVotes = this.getWinnerTotalVotes(proposal);

      if (winnerTotalVotes > 0) {
        const rewardShare = (votingPower / winnerTotalVotes) * totalRewardPool;
        return (votingPower + rewardShare).toString();
      }
    }

    // 失败方：仅本金
    return this.votingPower;
  }

  // 计算奖励池总额
  private calculateRewardPool(proposal: any): number {
    const proposalDeposit = parseFloat(proposal.proposalDeposit);
    const loserVotes = this.getLoserTotalVotes(proposal);
    const rewardPoolPercentage = 0.8; // 80%

    return proposalDeposit + loserVotes * rewardPoolPercentage;
  }

  // 获取胜利方总投票数
  private getWinnerTotalVotes(proposal: any): number {
    if (proposal.status === 'Succeeded') {
      return parseFloat(proposal.againstVotes);
    } else if (proposal.status === 'Failed') {
      return parseFloat(proposal.forVotes);
    }
    return 0;
  }

  // 获取失败方总投票数
  private getLoserTotalVotes(proposal: any): number {
    if (proposal.status === 'Succeeded') {
      return parseFloat(proposal.forVotes);
    } else if (proposal.status === 'Failed') {
      return parseFloat(proposal.againstVotes);
    }
    return 0;
  }
}
