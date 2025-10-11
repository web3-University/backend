import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { NonceService } from './services/nonce.service';
import { Web3VerifyService } from './services/web3-verify.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { getErrorMessage } from '../../utils/getErrorMessage';

/**
 * 认证服务
 * 处理 Web3 认证、JWT Token 生成和管理
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly domain: string;
  private readonly accessTokenExpiry = 15 * 60; // 15分钟（秒）
  private readonly refreshTokenExpiry = 7 * 24 * 60 * 60; // 7天（秒）

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly nonceService: NonceService,
    private readonly web3VerifyService: Web3VerifyService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.domain = this.configService.get<string>('APP_DOMAIN', 'localhost');
  }

  /**
   * 生成 Nonce（第一步：前端请求 Nonce）
   * @param walletAddress 钱包地址
   * @param origin 请求来源（用于 SIWE domain 匹配）
   * @returns Nonce 和待签名消息
   */
  async generateNonce(
    walletAddress: string,
    origin?: string,
  ): Promise<NonceResponseDto> {
    // 验证地址格式
    if (!this.web3VerifyService.isValidAddress(walletAddress)) {
      throw new BadRequestException('无效的钱包地址格式');
    }

    // 生成 Nonce
    const nonce = await this.nonceService.generateNonce(
      walletAddress.toLowerCase(),
    );

    // 生成 SIWE 标准消息，传入 origin 以确保 domain 匹配
    const message = this.web3VerifyService.generateSiweMessage(
      this.domain,
      walletAddress,
      nonce,
      1, // chainId
      origin,
    );

    const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60; // 5分钟后过期

    this.logger.log(`为地址 ${walletAddress} 生成 Nonce (origin: ${origin})`);

    return {
      nonce,
      message,
      expiresAt,
    };
  }

  /**
   * 登录验证（第二步：验证签名并生成 Token）
   * @param loginDto 登录数据
   * @param deviceInfo 设备信息
   * @param ipAddress IP 地址
   * @returns JWT Token 和用户信息
   */
  async login(
    loginDto: LoginDto,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<LoginResponseDto> {
    const { walletAddress, signature, message } = loginDto;
    const normalizedAddress = walletAddress.toLowerCase();

    // 1. 验证签名
    const isValidSignature = this.web3VerifyService.verifySignature(
      message,
      signature,
      normalizedAddress,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('签名验证失败');
    }

    // 2. 解析并验证 SIWE 消息
    try {
      const siweMessage = await this.web3VerifyService.verifySiweMessage(
        message,
        signature,
      );

      // 验证 Nonce
      const isNonceValid = await this.nonceService.validateAndConsumeNonce(
        normalizedAddress,
        siweMessage.nonce,
      );

      if (!isNonceValid) {
        throw new UnauthorizedException('Nonce 无效或已使用');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error(`SIWE 消息验证失败: ${errorMessage}`);
      throw new UnauthorizedException('消息验证失败');
    }

    // 3. 查找或创建用户
    let user = await this.userRepository.findOne({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      // 自动注册新用户
      user = this.userRepository.create({
        walletAddress: normalizedAddress,
        username: `User_${normalizedAddress.slice(0, 8)}`,
        isInstructorRegistered: false,
        isInstructorApproved: false,
      });
      await this.userRepository.save(user);
      this.logger.log(`新用户注册: ${normalizedAddress}`);
    }

    // 4. 生成 JWT Token
    const tokens = await this.generateTokens(user, deviceInfo, ipAddress);

    this.logger.log(`用户登录成功: ${normalizedAddress}`);

    return {
      ...tokens,
      user,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenExpiry,
    };
  }

  /**
   * 刷新 Token
   * @param refreshToken Refresh Token
   * @param deviceInfo 设备信息
   * @param ipAddress IP 地址
   * @returns 新的 Token
   */
  async refreshToken(
    refreshToken: string,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      // 1. 验证 Refresh Token
      const payload = this.jwtService.verify<{
        sub: string;
        jti: string;
        type: string;
        iat?: number;
        exp?: number;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // 2. 检查 Token 是否在数据库中且有效
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { tokenId: payload.jti, isActive: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh Token 无效或已被撤销');
      }

      // 3. 检查是否过期
      if (storedToken.expiresAt < new Date()) {
        await this.refreshTokenRepository.remove(storedToken);
        throw new UnauthorizedException('Refresh Token 已过期');
      }

      // 4. 获取用户信息
      const user = await this.userRepository.findOne({
        where: { walletAddress: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 5. 撤销旧的 Refresh Token
      await this.refreshTokenRepository.remove(storedToken);

      // 6. 生成新的 Token
      const tokens = await this.generateTokens(user, deviceInfo, ipAddress);

      this.logger.log(`Token 刷新成功: ${user.walletAddress}`);

      return {
        ...tokens,
        tokenType: 'Bearer',
        expiresIn: this.accessTokenExpiry,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error(`Token 刷新失败: ${errorMessage}`);
      throw new UnauthorizedException('Refresh Token 无效');
    }
  }

  /**
   * 登出（撤销 Refresh Token）
   * @param walletAddress 钱包地址
   * @param tokenId Token ID (jti)
   */
  async logout(walletAddress: string, tokenId?: string): Promise<void> {
    if (tokenId) {
      // 撤销特定 Token
      await this.refreshTokenRepository.update(
        { tokenId, walletAddress },
        { isActive: false },
      );
    } else {
      // 撤销该用户的所有 Token
      await this.refreshTokenRepository.update(
        { walletAddress },
        { isActive: false },
      );
    }

    this.logger.log(`用户登出: ${walletAddress}`);
  }

  /**
   * 获取用户的所有活动会话
   * @param walletAddress 钱包地址
   * @returns 会话列表
   */
  async getActiveSessions(walletAddress: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { walletAddress, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 撤销指定会话
   * @param walletAddress 钱包地址
   * @param sessionId 会话 ID
   */
  async revokeSession(walletAddress: string, sessionId: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { id: sessionId, walletAddress, isActive: true },
    });

    if (!token) {
      throw new BadRequestException('会话不存在或已失效');
    }

    token.isActive = false;
    await this.refreshTokenRepository.save(token);

    this.logger.log(`会话已撤销: ${sessionId}`);
  }

  /**
   * 生成 Access Token 和 Refresh Token
   * @param user 用户对象
   * @param deviceInfo 设备信息
   * @param ipAddress IP 地址
   * @returns Token 对象
   */
  private async generateTokens(
    user: User,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenId = randomUUID();

    // Access Token Payload
    const accessPayload = {
      sub: user.walletAddress,
      userId: user.userId,
      username: user.username,
      type: 'access',
    };

    // Refresh Token Payload
    const refreshPayload = {
      sub: user.walletAddress,
      jti: tokenId,
      type: 'refresh',
    };

    // 生成 Token
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTokenExpiry,
    });

    // 存储 Refresh Token 到数据库
    const refreshTokenEntity = this.refreshTokenRepository.create({
      tokenId,
      walletAddress: user.walletAddress,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + this.refreshTokenExpiry * 1000),
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  /**
   * 验证 Access Token（由 JWT Strategy 调用）
   * @param walletAddress 钱包地址
   * @returns 用户对象
   */
  async validateUser(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { walletAddress },
    });
  }
}
