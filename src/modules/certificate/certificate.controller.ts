import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CertificateService } from './certificate.service';
import { NFTCertificate } from './entities/nft-certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateCertificateApiDoc,
  getUserCertificatesApiDoc,
} from './swagger-doc';

@ApiTags('NFT证书管理')
// @UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  // 创建NFT证书
  @Post('create')
  @CreateCertificateApiDoc()
  async createCertificate(
    @Body() createCertificateDto: CreateCertificateDto,
  ): Promise<NFTCertificate> {
    return await this.certificateService.createCertificate(
      createCertificateDto.walletAddress,
      createCertificateDto.courseId,
    );
  }

  // 获取用户的证书列表
  @Get('user')
  @getUserCertificatesApiDoc()
  async getUserCertificates(
    @Query('walletAddress') walletAddress: string,
  ): Promise<NFTCertificate[]> {
    return await this.certificateService.getUserCertificates(walletAddress);
  }
}
