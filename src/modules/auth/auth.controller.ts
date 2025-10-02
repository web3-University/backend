import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  // Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { NonceRequestDto } from './dto/nonce-request.dto';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  NonceApiDoc,
  LoginApiDoc,
  RefreshTokenApiDoc,
  LogoutApiDoc,
  GetMeApiDoc,
  GetSessionsApiDoc,
  RevokeSessionApiDoc,
  LogoutAllApiDoc,
} from './swagger-doc';

/**
 * 认证控制器
 * 处理 Web3 认证相关的 HTTP 请求
 */
@ApiTags('认证管理')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 获取 Nonce（第一步）
   * 限流：每分钟最多 10 次请求
   */
  @Public()
  // @Version('2')
  @Post('nonce')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @NonceApiDoc()
  async getNonce(
    @Body() nonceRequestDto: NonceRequestDto,
    @Req() req: Request,
  ): Promise<NonceResponseDto> {
    const origin = req.headers.origin || req.headers.referer;
    return this.authService.generateNonce(
      nonceRequestDto.walletAddress,
      origin,
    );
  }

  /**
   * 登录（第二步）
   * 验证签名并生成 JWT Token
   */
  @Public()
  @Post('login')
  @LoginApiDoc()
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

    return this.authService.login(loginDto, deviceInfo, ipAddress);
  }

  /**
   * 刷新 Token
   */
  @Public()
  @Post('refresh')
  @RefreshTokenApiDoc()
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshTokenResponseDto> {
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';

    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceInfo,
      ipAddress,
    );
  }

  /**
   * 登出（撤销当前 Token）
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @LogoutApiDoc()
  async logout(@CurrentUser('walletAddress') walletAddress: string) {
    await this.authService.logout(walletAddress);
    return { message: '登出成功' };
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @GetMeApiDoc()
  getMe(
    @CurrentUser()
    user: {
      walletAddress: string;
      userId: number;
      username: string;
    },
  ) {
    return user;
  }

  /**
   * 获取所有活动会话
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @GetSessionsApiDoc()
  async getSessions(@CurrentUser('walletAddress') walletAddress: string) {
    const sessions = await this.authService.getActiveSessions(walletAddress);
    return {
      total: sessions.length,
      sessions: sessions.map((session) => ({
        id: session.id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        expiresAt: session.expiresAt,
      })),
    };
  }

  /**
   * 撤销指定会话
   */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @RevokeSessionApiDoc()
  async revokeSession(
    @CurrentUser('walletAddress') walletAddress: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.authService.revokeSession(walletAddress, sessionId);
    return { message: '会话已撤销' };
  }

  /**
   * 撤销所有会话（登出所有设备）
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @LogoutAllApiDoc()
  async logoutAll(@CurrentUser('walletAddress') walletAddress: string) {
    await this.authService.logout(walletAddress);
    return { message: '所有设备已登出' };
  }
}
