import {
  Module,
  MiddlewareConsumer,
  NestModule,
  // RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { HelmetMiddleware } from '@nest-middlewares/helmet';

import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { StorageModule } from './modules/storage/storage.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { EmailModule } from './modules/email/email.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from './config/database.config';
import { winstonConfig } from './config/winston.config';
import { validate } from './config/env.validation';
import { MulterModule } from '@nestjs/platform-express';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppLoggerService } from './common/services/logger.service';
import { AuthModule } from './modules/auth/auth.module';
import { DAOModule } from './modules/dao/dao.module';

/**
 * 应用主模块
 * 负责导入所有必要的模块和配置
 */
@Module({
  controllers: [],
  providers: [AppLoggerService],
  imports: [
    WinstonModule.forRoot(winstonConfig),
    // 配置模块 - 加载环境变量并验证
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? ['.env.development', '.env']
          : ['.env.production', '.env'], // 环境变量文件路径
      validate, // 环境变量验证
    }),

    // 数据库配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createDatabaseConfig,
      inject: [ConfigService],
    }),

    // 文件上传配置
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),

    // 业务模块
    UserModule,
    CourseModule,
    StorageModule,
    AuthModule,
    CertificateModule,
    EmailModule,
    PerformanceModule,
    DAOModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用请求日志中间件到所有路由
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');

    // 添加helmet防护，可以查看docs/helmet.md
    consumer
      .apply(HelmetMiddleware)
      // 放开某些接口时候配置
      // .exclude({ path: 'upload/chunk', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
