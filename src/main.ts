import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
  INestApplication,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLoggerService } from './common/services/logger.service';
import { initSwagger } from './utils/initSwagger';

let app: INestApplication;

/**
 * 应用程序启动入口
 * 配置全局中间件和管道
 */
async function bootstrap() {
  if (app) {
    return app;
  }

  app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 使用Winston作为应用日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(AppLoggerService);

  const apiPrefix = process.env.API_PREFIX || 'api';

  // 设置全局前缀
  app.setGlobalPrefix(apiPrefix);
  logger.log(`设置全局API前缀: /${apiPrefix}`, 'Bootstrap');

  // 启用版本控制（URI方式）
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  logger.log('API版本控制已启用（URI模式）', 'Bootstrap');

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Timestamp',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true,
  });

  // Swagger 配置
  initSwagger(app, logger);

  // 在Vercel环境中不启动服务器
  if (process.env.VERCEL) {
    logger.log('🚀 应用程序在Vercel环境中运行', 'Bootstrap');
    logger.log(
      `📚 API文档地址: https://${process.env.VERCEL_URL}/${apiPrefix}`,
      'Bootstrap',
    );
    logger.log(`🌐 环境: ${process.env.NODE_ENV || 'production'}`, 'Bootstrap');
    logger.log(`🔗 API前缀: /${apiPrefix}`, 'Bootstrap');
    return app;
  } 

  // 本地开发环境启动服务器
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 应用程序运行在 http://localhost:${port}`, 'Bootstrap');
  logger.log(
    `📚 API文档地址: http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
  logger.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
  logger.log(`🔗 API前缀: /${apiPrefix}`, 'Bootstrap');

  return app;
}

// Vercel无服务器函数导出
export default async (req: Request, res: Response) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res) as Response;
};

// 本地开发环境启动
if (!process.env.VERCEL) {
  bootstrap();
}
