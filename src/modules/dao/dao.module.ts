import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DAOController } from './dao.controller';
import { DAOService } from './dao.service';
import { DAOProposal } from './entities/dao-proposal.entity';
import { DAOVote } from './entities/dao-vote.entity';
import { DAOConfig } from './entities/dao-config.entity';
import { Course } from '../course/entities/course.entity';

/**
 * DAO 模块
 * 提供课程质量投票相关的功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DAOProposal, DAOVote, DAOConfig, Course]),
  ],
  controllers: [DAOController],
  providers: [DAOService],
  exports: [DAOService], // 导出服务供其他模块使用
})
export class DAOModule {}
