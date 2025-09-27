import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { StorageModule } from './modules/storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from './config/database.config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './modules/storage/storage.controller';

/**
 * 应用主模块
 * 负责导入所有必要的模块和配置
 */
@Module({
  controllers: [UploadController],
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
    StorageModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createDatabaseConfig,
      inject: [ConfigService],
    }),
    // 配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: '.env', // 环境变量文件路径
    }),
    // 用户模块
    UserModule,
  ],
})
export class AppModule { }
