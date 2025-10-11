import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

/**
 * JWT Payload 接口定义
 */
interface JwtPayload {
  sub: string; // 钱包地址
  userId: number;
  username: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * JWT 认证策略
 * 从请求头中提取并验证 JWT Token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * 验证 JWT Payload
   * @param payload JWT 载荷
   * @returns 用户对象
   */
  async validate(payload: JwtPayload) {
    // 验证 Token 类型
    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的 Token 类型');
    }

    // 从数据库获取用户信息
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回用户对象（会被注入到 Request.user）
    return {
      walletAddress: user.walletAddress,
      userId: user.userId,
      username: user.username,
    };
  }
}
