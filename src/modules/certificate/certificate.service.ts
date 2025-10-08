import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFTCertificate } from './entities/nft-certificate.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { StorachaStorageService } from '../storage/storage.service';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(NFTCertificate)
    private certificateRepository: Repository<NFTCertificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storageService: StorachaStorageService,
  ) {}

  /**
   * 生成SVG证书
   */
  private generateSVGCertificate(
    walletAddress: string,
    courseId: number,
    courseTitle: string,
    username?: string,
  ): string {
    const displayName = username || walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    const completionDate = new Date().toLocaleDateString('zh-CN');
    
    return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="800" height="600" fill="url(#bg)" />
  
  <!-- 边框装饰 -->
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="url(#border)" stroke-width="4" rx="20" />
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="15" />
  
  <!-- 标题 -->
  <text x="400" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">
    Web3大学
  </text>
  <text x="400" y="160" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24">
    课程完成证书
  </text>
  
  <!-- 证书内容 -->
  <text x="400" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
    兹证明
  </text>
  
  <text x="400" y="300" text-anchor="middle" fill="#FFD700" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
    ${displayName}
  </text>
  
  <text x="400" y="350" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
    已完成课程
  </text>
  
  <text x="400" y="400" text-anchor="middle" fill="#FFD700" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    ${courseTitle}
  </text>
  
  <text x="400" y="450" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16">
    完成日期：${completionDate}
  </text>
  
  <!-- 底部信息 -->
  <text x="400" y="520" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="14">
    课程ID: ${courseId} | 钱包地址: ${walletAddress}
  </text>
  
  <!-- 装饰性元素 -->
  <circle cx="150" cy="200" r="30" fill="rgba(255,255,255,0.1)" />
  <circle cx="650" cy="200" r="30" fill="rgba(255,255,255,0.1)" />
  <circle cx="150" cy="400" r="20" fill="rgba(255,255,255,0.1)" />
  <circle cx="650" cy="400" r="20" fill="rgba(255,255,255,0.1)" />
</svg>`.trim();
  }

  /**
   * 生成NFT元数据
   */
  private generateMetadata(
    walletAddress: string,
    courseId: number,
    courseTitle: string,
    svgUrl: string,
    username?: string,
  ): any {
    return {
      name: `Web3大学课程证书 - ${courseTitle}`,
      description: `恭喜 ${username || walletAddress} 完成课程 "${courseTitle}"！`,
      image: svgUrl,
      attributes: [
        {
          trait_type: '课程ID',
          value: courseId.toString(),
        },
        {
          trait_type: '完成者',
          value: walletAddress,
        },
        {
          trait_type: '课程名称',
          value: courseTitle,
        },
        {
          trait_type: '完成日期',
          value: new Date().toISOString(),
        },
        {
          trait_type: '平台',
          value: 'Web3大学',
        },
      ],
      external_url: `https://web3-university.com/certificate/${courseId}`,
    };
  }

  /**
   * 创建NFT证书
   */
  async createCertificate(
    walletAddress: string,
    courseId: number,
  ): Promise<NFTCertificate> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { courseId },
    });
    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }

    // 检查是否已经为该用户和课程创建过证书
    const existingCertificate = await this.certificateRepository.findOne({
      where: { walletAddress, courseId },
    });
    if (existingCertificate) {
      throw new NotFoundException('该用户已经拥有此课程的证书');
    }

    // 生成SVG证书
    const svgContent = this.generateSVGCertificate(
      walletAddress,
      courseId,
      course.title,
      user.username,
    );

    // 上传SVG到IPFS
    const svgBuffer = Buffer.from(svgContent, 'utf-8');
    const svgResult = await this.storageService.uploadToPinata(svgBuffer, 'certificate.svg');
    const svgUrl = svgResult.gatewayUrl;

    // 生成元数据
    const metadata = this.generateMetadata(
      walletAddress,
      courseId,
      course.title,
      svgUrl,
      user.username,
    );

    // 上传元数据到IPFS
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8');
    const metadataResult = await this.storageService.uploadToPinata(metadataBuffer, 'metadata.json');
    const metadataUrl = metadataResult.gatewayUrl;

    // 生成唯一的tokenId
    const tokenId = `${courseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建证书记录
    const certificate = this.certificateRepository.create({
      tokenId,
      contractAddress: '0x0000000000000000000000000000000000000000', // 占位符，实际部署时替换
      walletAddress,
      courseId,
      completionDate: new Date(),
      metadata: metadataUrl,
      nftUrl: svgUrl, // 保存NFT预览链接
      transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000', // 占位符
      blockNumber: 0, // 占位符
    });

    return await this.certificateRepository.save(certificate);
  }

  /**
   * 获取用户的证书列表
   */
  async getUserCertificates(walletAddress: string): Promise<NFTCertificate[]> {
    return await this.certificateRepository.find({
      where: { walletAddress },
      relations: ['course'],
      order: { completionDate: 'DESC' },
    });
  }
}
