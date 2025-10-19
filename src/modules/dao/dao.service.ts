import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { DAOProposal } from './entities/dao-proposal.entity';
import { DAOVote } from './entities/dao-vote.entity';
import { DAOConfig } from './entities/dao-config.entity';
import { Course } from '../course/entities/course.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { VoteDto } from './dto/vote.dto';
import { GetProposalsDto } from './dto/get-proposals.dto';
import { UpdateDAOConfigDto } from './dto/update-dao-config.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';

/**
 * DAO 服务
 * 处理课程质量投票相关的业务逻辑
 */
@Injectable()
export class DAOService {
  private readonly logger = new Logger(DAOService.name);

  constructor(
    @InjectRepository(DAOProposal)
    private readonly proposalRepository: Repository<DAOProposal>,
    @InjectRepository(DAOVote)
    private readonly voteRepository: Repository<DAOVote>,
    @InjectRepository(DAOConfig)
    private readonly configRepository: Repository<DAOConfig>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * 创建提案
   */
  async createProposal(dto: CreateProposalDto): Promise<DAOProposal> {
    this.logger.log(
      `用户 ${dto.proposerWallet} 为课程 ${dto.courseId} 创建提案`,
    );

    // 验证课程存在
    const course = await this.courseRepository.findOne({
      where: { courseId: dto.courseId },
      relations: ['userProgresses'],
    });

    if (!course) {
      throw new NotFoundException(`课程 ${dto.courseId} 不存在`);
    }

    // 检查是否已有活跃提案
    const existingProposal = await this.proposalRepository.findOne({
      where: { courseId: dto.courseId, status: 'Active' },
    });

    if (existingProposal) {
      throw new ConflictException(`课程 ${dto.courseId} 已有活跃提案`);
    }

    // 获取 DAO 配置
    const config = await this.getDAOConfig();

    // 验证提案押金
    if (parseFloat(dto.proposalDeposit) < parseFloat(config.proposalDeposit)) {
      throw new BadRequestException(
        `提案押金不能少于 ${config.proposalDeposit} YD`,
      );
    }

    // 创建提案
    const now = new Date();
    const votingEndTime = new Date(now.getTime() + config.votingPeriod * 1000);

    const proposal = this.proposalRepository.create({
      courseId: dto.courseId,
      proposerWallet: dto.proposerWallet,
      reason: dto.reason,
      proposalDeposit: dto.proposalDeposit,
      votingStartTime: now,
      votingEndTime,
      course,
    });

    const savedProposal = await this.proposalRepository.save(proposal);
    this.logger.log(`提案创建成功，ID: ${savedProposal.proposalId}`);

    return savedProposal;
  }

  /**
   * 投票
   */
  async vote(proposalId: number, dto: VoteDto): Promise<DAOVote> {
    this.logger.log(`用户 ${dto.voterWallet} 对提案 ${proposalId} 投票`);

    // 获取提案
    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['course'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    // 验证提案状态
    if (proposal.status !== 'Active') {
      throw new BadRequestException(`提案 ${proposalId} 不是活跃状态`);
    }

    // 验证投票时间
    const now = new Date();
    if (now < proposal.votingStartTime || now > proposal.votingEndTime) {
      throw new BadRequestException('当前不在投票时间内');
    }

    // 检查是否已投票
    const existingVote = await this.voteRepository.findOne({
      where: { proposalId, voterWallet: dto.voterWallet },
    });

    if (existingVote) {
      throw new ConflictException('您已经投过票了');
    }

    // 获取 DAO 配置
    const config = await this.getDAOConfig();

    // 验证投票权重
    if (parseFloat(dto.votingPower) < parseFloat(config.minVotingPower)) {
      throw new BadRequestException(
        `投票权重不能少于 ${config.minVotingPower} YD`,
      );
    }

    // 创建投票记录
    const vote = this.voteRepository.create({
      proposalId,
      voterWallet: dto.voterWallet,
      option: dto.option,
      votingPower: dto.votingPower,
    });

    const savedVote = await this.voteRepository.save(vote);

    // 更新提案投票统计
    await this.updateProposalVotes(proposalId);

    this.logger.log(
      `投票成功，用户 ${dto.voterWallet} 投了 ${dto.option === 0 ? 'For' : 'Against'} 票`,
    );

    return savedVote;
  }

  /**
   * 结束投票
   */
  async finalizeProposal(proposalId: number): Promise<DAOProposal> {
    this.logger.log(`结束提案 ${proposalId} 的投票`);

    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['course', 'votes'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    if (proposal.status !== 'Active') {
      throw new BadRequestException(`提案 ${proposalId} 不是活跃状态`);
    }

    const now = new Date();
    if (now < proposal.votingEndTime) {
      throw new BadRequestException('投票尚未结束');
    }

    // 更新提案状态
    if (proposal.hasReachedQuorum && proposal.isPassed) {
      proposal.status = 'Succeeded';
    } else {
      proposal.status = 'Failed';
    }

    const updatedProposal = await this.proposalRepository.save(proposal);
    this.logger.log(`提案 ${proposalId} 状态更新为 ${proposal.status}`);

    return updatedProposal;
  }

  /**
   * 执行提案
   */
  async executeProposal(proposalId: number): Promise<DAOProposal> {
    this.logger.log(`执行提案 ${proposalId}`);

    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['course'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    if (!proposal.canExecute) {
      throw new BadRequestException(`提案 ${proposalId} 无法执行`);
    }

    // 执行治理操作（这里可以添加具体的课程下架逻辑）
    proposal.executed = true;
    proposal.executedAt = new Date();
    proposal.status = 'Executed';

    const updatedProposal = await this.proposalRepository.save(proposal);
    this.logger.log(`提案 ${proposalId} 执行完成`);

    return updatedProposal;
  }

  /**
   * 领取奖励
   */
  async claimReward(
    proposalId: number,
    dto: ClaimRewardDto,
  ): Promise<{ reward: string }> {
    this.logger.log(`用户 ${dto.voterWallet} 领取提案 ${proposalId} 的奖励`);

    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['votes'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    if (!['Succeeded', 'Failed', 'Executed'].includes(proposal.status)) {
      throw new BadRequestException('提案尚未完成，无法领取奖励');
    }

    const vote = await this.voteRepository.findOne({
      where: { proposalId, voterWallet: dto.voterWallet },
    });

    if (!vote) {
      throw new NotFoundException('您没有参与此提案的投票');
    }

    if (vote.rewardClaimed) {
      throw new BadRequestException('您已经领取过奖励了');
    }

    // 计算奖励
    const reward = vote.calculateReward(proposal);

    // 标记已领取
    vote.rewardClaimed = true;
    vote.claimedAt = new Date();
    await this.voteRepository.save(vote);

    this.logger.log(`用户 ${dto.voterWallet} 领取奖励 ${reward} YD`);

    return { reward };
  }

  /**
   * 取消提案
   */
  async cancelProposal(
    proposalId: number,
    proposerWallet: string,
  ): Promise<DAOProposal> {
    this.logger.log(`用户 ${proposerWallet} 取消提案 ${proposalId}`);

    const proposal = await this.proposalRepository.findOne({
      where: { proposalId, proposerWallet },
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在或您不是提案人`);
    }

    if (proposal.status !== 'Active') {
      throw new BadRequestException(`提案 ${proposalId} 不是活跃状态`);
    }

    // 检查取消时间限制
    const config = await this.getDAOConfig();
    const now = new Date();
    const timeLimit = new Date(
      proposal.votingStartTime.getTime() + config.cancelTimeLimit * 1000,
    );

    if (now > timeLimit) {
      throw new BadRequestException('已超过取消时间限制');
    }

    // 检查是否有人投票
    const voteCount = await this.voteRepository.count({
      where: { proposalId },
    });

    if (voteCount > 0) {
      throw new BadRequestException('已有用户投票，无法取消提案');
    }

    // 更新提案状态
    proposal.status = 'Canceled';
    const updatedProposal = await this.proposalRepository.save(proposal);

    this.logger.log(`提案 ${proposalId} 已取消`);

    return updatedProposal;
  }

  /**
   * 获取提案列表
   */
  async getProposals(query: GetProposalsDto) {
    const {
      page = 1,
      limit = 10,
      courseId,
      status,
      proposerWallet,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const options: FindManyOptions<DAOProposal> = {
      relations: ['course', 'votes'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (courseId) {
      options.where = { ...options.where, courseId };
    }

    if (status) {
      options.where = { ...options.where, status };
    }

    if (proposerWallet) {
      options.where = { ...options.where, proposerWallet };
    }

    const [proposals, total] =
      await this.proposalRepository.findAndCount(options);

    return {
      proposals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取提案详情
   */
  async getProposal(proposalId: number): Promise<DAOProposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['course', 'votes'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    return proposal;
  }

  /**
   * 获取课程提案
   */
  async getCourseProposal(
    courseId: number,
  ): Promise<{ proposalId: number | null; hasActive: boolean }> {
    const proposal = await this.proposalRepository.findOne({
      where: { courseId, status: 'Active' },
    });

    return {
      proposalId: proposal?.proposalId || null,
      hasActive: !!proposal,
    };
  }

  /**
   * 计算用户奖励
   */
  async calculateReward(
    proposalId: number,
    voterWallet: string,
  ): Promise<string> {
    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['votes'],
    });

    if (!proposal) {
      throw new NotFoundException(`提案 ${proposalId} 不存在`);
    }

    const vote = await this.voteRepository.findOne({
      where: { proposalId, voterWallet },
    });

    if (!vote) {
      throw new NotFoundException('您没有参与此提案的投票');
    }

    return vote.calculateReward(proposal);
  }

  /**
   * 检查用户是否可以投票
   */
  async canVote(proposalId: number, voterWallet: string): Promise<boolean> {
    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
    });

    if (!proposal || proposal.status !== 'Active') {
      return false;
    }

    const now = new Date();
    if (now < proposal.votingStartTime || now > proposal.votingEndTime) {
      return false;
    }

    const existingVote = await this.voteRepository.findOne({
      where: { proposalId, voterWallet },
    });

    return !existingVote;
  }

  /**
   * 获取 DAO 配置
   */
  async getDAOConfig(): Promise<DAOConfig> {
    let config = await this.configRepository.findOne({ where: {} });

    if (!config) {
      // 创建默认配置
      config = this.configRepository.create({
        proposalDeposit: '1000',
        minVotingPower: '100',
        votingPeriod: 604800, // 7天
        quorumPercentage: 1000, // 10%
        passThreshold: 5000, // 50%
        rewardPoolPercentage: 8000, // 80%
        cancelTimeLimit: 86400, // 24小时
        isEnabled: true,
      });

      config = await this.configRepository.save(config);
    }

    return config;
  }

  /**
   * 更新 DAO 配置
   */
  async updateDAOConfig(dto: UpdateDAOConfigDto): Promise<DAOConfig> {
    let config = await this.configRepository.findOne({ where: {} });

    if (!config) {
      config = this.configRepository.create();
    }

    Object.assign(config, dto);
    const updatedConfig = await this.configRepository.save(config);

    this.logger.log('DAO 配置已更新');

    return updatedConfig;
  }

  /**
   * 获取 DAO 统计信息
   */
  async getDAOStats() {
    const [
      totalProposals,
      activeProposals,
      succeededProposals,
      failedProposals,
      totalVoters,
    ] = await Promise.all([
      this.proposalRepository.count(),
      this.proposalRepository.count({ where: { status: 'Active' } }),
      this.proposalRepository.count({ where: { status: 'Succeeded' } }),
      this.proposalRepository.count({ where: { status: 'Failed' } }),
      this.voteRepository.count(),
    ]);

    return {
      totalProposals,
      activeProposals,
      succeededProposals,
      failedProposals,
      totalVoters,
    };
  }

  /**
   * 更新提案投票统计
   */
  private async updateProposalVotes(proposalId: number): Promise<void> {
    const proposal = await this.proposalRepository.findOne({
      where: { proposalId },
      relations: ['votes'],
    });

    if (!proposal) return;

    let forVotes = 0;
    let againstVotes = 0;
    let totalVotingPower = 0;

    for (const vote of proposal.votes) {
      const power = parseFloat(vote.votingPower);
      totalVotingPower += power;

      if (vote.option === 0) {
        forVotes += power;
      } else {
        againstVotes += power;
      }
    }

    proposal.forVotes = forVotes.toString();
    proposal.againstVotes = againstVotes.toString();
    proposal.totalVotingPower = totalVotingPower.toString();

    await this.proposalRepository.save(proposal);
  }
}
