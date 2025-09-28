import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLoggerService } from './common/services/logger.service';

/**
 * 应用程序启动入口
 * 配置全局中间件和管道
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用Winston作为应用日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(AppLoggerService);

  // 设置全局前缀
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局验证管道 - 自动验证请求数据
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 只允许DTO中定义的属性
    forbidNonWhitelisted: true, // 禁止未定义的属性
    transform: true, // 自动转换类型
    transformOptions: {
      enableImplicitConversion: true, // 启用隐式类型转换
    },
  }));

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Timestamp'
    ],
    credentials: true,
  });

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('Web3 University API')
    .setDescription('Web3去中心化教育平台API文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Wallet-Address',
        in: 'header',
        description: 'Web3钱包地址',
      },
      'wallet-auth'
    )
    .addTag('users', '用户管理')
    .addTag('teachers', '讲师管理')
    .addTag('courses', '课程管理')
    .addTag('lessons', '课时管理')
    .addTag('certificates', 'NFT证书管理')
    .addTag('payments', '支付管理')
    .addTag('progress', '学习进度')
    .addTag('notifications', '通知管理')
    .addTag('storage', '文件存储')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.API_PREFIX || 'api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 8051;
  await app.listen(port);
  
  logger.log(`🚀 应用程序运行在 http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 API文档地址: http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
  logger.log(`🔗 API前缀: /${process.env.API_PREFIX || 'api'}`, 'Bootstrap');
}

bootstrap();
