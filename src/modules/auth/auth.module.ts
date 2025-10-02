import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { NonceService } from './services/nonce.service';
import { Web3VerifyService } from './services/web3-verify.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 认证模块
 * 提供 Web3 认证、JWT Token 管理等功能
 */
@Module({
  imports: [
    // TypeORM 实体
    TypeOrmModule.forFeature([User, RefreshToken]),

    // Passport 认证
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Access Token 默认过期时间
        },
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 秒
        limit: 10, // 最多 10 次请求
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    NonceService,
    Web3VerifyService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard], // 导出服务供其他模块使用
})
export class AuthModule {}
