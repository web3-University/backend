import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  // Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取 Nonce（用于签名）' })
  @ApiBody({ type: NonceRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Nonce 生成成功',
    type: NonceResponseDto,
  })
  @ApiResponse({ status: 400, description: '无效的钱包地址' })
  @ApiResponse({ status: 429, description: '请求过于频繁' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录（验证签名）' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: '签名验证失败' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Access Token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token 刷新成功',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Refresh Token 无效' })
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '登出（撤销 Token）' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async logout(@CurrentUser('walletAddress') walletAddress: string) {
    await this.authService.logout(walletAddress);
    return { message: '登出成功' };
  }

  /**
   * 获取当前用户信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有活动会话' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销指定会话' })
  @ApiResponse({ status: 200, description: '会话已撤销' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '会话不存在' })
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '登出所有设备' })
  @ApiResponse({ status: 200, description: '所有会话已撤销' })
  @ApiResponse({ status: 401, description: '未授权' })
  async logoutAll(@CurrentUser('walletAddress') walletAddress: string) {
    await this.authService.logout(walletAddress);
    return { message: '所有设备已登出' };
  }
}
