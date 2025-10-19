import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DAOService } from './dao.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { VoteDto } from './dto/vote.dto';
import { GetProposalsDto } from './dto/get-proposals.dto';
import { UpdateDAOConfigDto } from './dto/update-dao-config.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * DAO 控制器
 * 提供课程质量投票相关的 API 接口
 */
@ApiTags('DAO - 课程质量投票')
@Controller('dao')
// @UseGuards(JwtAuthGuard)
export class DAOController {
  constructor(private readonly daoService: DAOService) {}

  /**
   * 创建提案
   */
  @Post('proposals')
  @ApiOperation({ summary: '创建课程质量投票提案' })
  @ApiResponse({ status: 201, description: '提案创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 409, description: '课程已有活跃提案' })
  async createProposal(@Body() dto: CreateProposalDto) {
    return this.daoService.createProposal(dto);
  }

  /**
   * 投票
   */
  @Post('proposals/:id/vote')
  @ApiOperation({ summary: '对提案进行投票' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 201, description: '投票成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或投票时间已过' })
  @ApiResponse({ status: 404, description: '提案不存在' })
  @ApiResponse({ status: 409, description: '已经投过票了' })
  async vote(
    @Param('id', ParseIntPipe) proposalId: number,
    @Body() dto: VoteDto,
  ) {
    return this.daoService.vote(proposalId, dto);
  }

  /**
   * 结束投票
   */
  @Post('proposals/:id/finalize')
  @ApiOperation({ summary: '结束提案投票' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 200, description: '投票结束成功' })
  @ApiResponse({ status: 400, description: '提案状态错误或投票时间未到' })
  @ApiResponse({ status: 404, description: '提案不存在' })
  @HttpCode(HttpStatus.OK)
  async finalizeProposal(@Param('id', ParseIntPipe) proposalId: number) {
    return this.daoService.finalizeProposal(proposalId);
  }

  /**
   * 执行提案
   */
  @Post('proposals/:id/execute')
  @ApiOperation({ summary: '执行提案' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 200, description: '提案执行成功' })
  @ApiResponse({ status: 400, description: '提案无法执行' })
  @ApiResponse({ status: 404, description: '提案不存在' })
  @HttpCode(HttpStatus.OK)
  async executeProposal(@Param('id', ParseIntPipe) proposalId: number) {
    return this.daoService.executeProposal(proposalId);
  }

  /**
   * 领取奖励
   */
  @Post('proposals/:id/claim-reward')
  @ApiOperation({ summary: '领取投票奖励' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 200, description: '奖励领取成功' })
  @ApiResponse({ status: 400, description: '无法领取奖励' })
  @ApiResponse({ status: 404, description: '提案不存在或未参与投票' })
  @HttpCode(HttpStatus.OK)
  async claimReward(
    @Param('id', ParseIntPipe) proposalId: number,
    @Body() dto: ClaimRewardDto,
  ) {
    return this.daoService.claimReward(proposalId, dto);
  }

  /**
   * 取消提案
   */
  @Delete('proposals/:id')
  @ApiOperation({ summary: '取消提案' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 200, description: '提案取消成功' })
  @ApiResponse({ status: 400, description: '无法取消提案' })
  @ApiResponse({ status: 404, description: '提案不存在或您不是提案人' })
  @HttpCode(HttpStatus.OK)
  async cancelProposal(
    @Param('id', ParseIntPipe) proposalId: number,
    @Body('proposerWallet') proposerWallet: string,
  ) {
    return this.daoService.cancelProposal(proposalId, proposerWallet);
  }

  /**
   * 获取提案列表
   */
  @Get('proposals')
  @ApiOperation({ summary: '获取提案列表' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    type: 'number',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: '课程ID',
    type: 'number',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '提案状态',
    enum: ['Active', 'Succeeded', 'Failed', 'Canceled', 'Executed'],
  })
  @ApiQuery({
    name: 'proposerWallet',
    required: false,
    description: '提案人钱包地址',
    type: 'string',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '排序字段',
    enum: ['createdAt', 'votingEndTime', 'forVotes', 'againstVotes'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '排序方向',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProposals(@Query() query: GetProposalsDto) {
    return this.daoService.getProposals(query);
  }

  /**
   * 获取提案详情
   */
  @Get('proposals/:id')
  @ApiOperation({ summary: '获取提案详情' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '提案不存在' })
  async getProposal(@Param('id', ParseIntPipe) proposalId: number) {
    return this.daoService.getProposal(proposalId);
  }

  /**
   * 获取课程提案
   */
  @Get('courses/:courseId/proposal')
  @ApiOperation({ summary: '获取课程的活跃提案' })
  @ApiParam({ name: 'courseId', description: '课程ID', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCourseProposal(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.daoService.getCourseProposal(courseId);
  }

  /**
   * 计算用户奖励
   */
  @Get('proposals/:id/reward/:voterWallet')
  @ApiOperation({ summary: '计算用户可领取的奖励' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiParam({
    name: 'voterWallet',
    description: '投票人钱包地址',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: '计算成功' })
  @ApiResponse({ status: 404, description: '提案不存在或未参与投票' })
  async calculateReward(
    @Param('id', ParseIntPipe) proposalId: number,
    @Param('voterWallet') voterWallet: string,
  ) {
    const reward = await this.daoService.calculateReward(
      proposalId,
      voterWallet,
    );
    return { reward };
  }

  /**
   * 检查用户是否可以投票
   */
  @Get('proposals/:id/can-vote/:voterWallet')
  @ApiOperation({ summary: '检查用户是否可以投票' })
  @ApiParam({ name: 'id', description: '提案ID', type: 'number' })
  @ApiParam({
    name: 'voterWallet',
    description: '投票人钱包地址',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: '检查成功' })
  async canVote(
    @Param('id', ParseIntPipe) proposalId: number,
    @Param('voterWallet') voterWallet: string,
  ) {
    const canVote = await this.daoService.canVote(proposalId, voterWallet);
    return { canVote };
  }

  /**
   * 获取 DAO 配置
   */
  @Get('config')
  @ApiOperation({ summary: '获取 DAO 配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDAOConfig() {
    return this.daoService.getDAOConfig();
  }

  /**
   * 更新 DAO 配置
   */
  @Put('config')
  @ApiOperation({ summary: '更新 DAO 配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '配置参数错误' })
  async updateDAOConfig(@Body() dto: UpdateDAOConfigDto) {
    return this.daoService.updateDAOConfig(dto);
  }

  /**
   * 获取 DAO 统计信息
   */
  @Get('stats')
  @ApiOperation({ summary: '获取 DAO 统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDAOStats() {
    return this.daoService.getDAOStats();
  }
}
