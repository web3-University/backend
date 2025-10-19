import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * DAO 配置实体
 * 存储 DAO 系统的各种参数配置
 */
@Entity('dao_config')
export class DAOConfig extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 提案押金（YD币数量）
  @Column({ type: 'varchar', length: 50, default: '1000' })
  proposalDeposit: string;

  // 最小投票权重（YD币数量）
  @Column({ type: 'varchar', length: 50, default: '100' })
  minVotingPower: string;

  // 投票期限（秒）
  @Column({ default: 604800 }) // 7天 = 7 * 24 * 60 * 60
  votingPeriod: number;

  // 法定人数百分比（基点，10000 = 100%）
  @Column({ default: 1000 }) // 10%
  quorumPercentage: number;

  // 通过阈值（基点，10000 = 100%）
  @Column({ default: 5000 }) // 50%
  passThreshold: number;

  // 奖励池百分比（基点，10000 = 100%）
  @Column({ default: 8000 }) // 80%
  rewardPoolPercentage: number;

  // 取消提案时间限制（秒）
  @Column({ default: 86400 }) // 24小时
  cancelTimeLimit: number;

  // 是否启用DAO功能
  @Column({ default: true })
  isEnabled: boolean;

  // 管理员钱包地址
  @Column({ nullable: true })
  adminWallet?: string;

  // 获取投票期限（天）
  get votingPeriodDays(): number {
    return this.votingPeriod / (24 * 60 * 60);
  }

  // 获取取消时间限制（小时）
  get cancelTimeLimitHours(): number {
    return this.cancelTimeLimit / 3600;
  }

  // 获取法定人数百分比（小数）
  get quorumPercentageDecimal(): number {
    return this.quorumPercentage / 10000;
  }

  // 获取通过阈值（小数）
  get passThresholdDecimal(): number {
    return this.passThreshold / 10000;
  }

  // 获取奖励池百分比（小数）
  get rewardPoolPercentageDecimal(): number {
    return this.rewardPoolPercentage / 10000;
  }
}
