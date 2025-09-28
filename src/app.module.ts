import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { StorageModule } from './modules/storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from './config/database.config';
import { winstonConfig } from './config/winston.config';
import { validate } from './config/env.validation';
import { MulterModule } from '@nestjs/platform-express';
// import { UploadController } from './modules/storage/storage.controller';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppLoggerService } from './common/services/logger.service';

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
      envFilePath: false ? ['.env.development', '.env'] : ['.env.production', '.env'], // 环境变量文件路径
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用请求日志中间件到所有路由
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
