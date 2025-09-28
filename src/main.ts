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
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Lambda 环境下缓冲日志
  });
  
  // 使用Winston作为应用日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(AppLoggerService);

  // 检查是否在Lambda环境中
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const apiPrefix = process.env.API_PREFIX || 'api';
  
  // 设置全局前缀
  app.setGlobalPrefix(apiPrefix);
  logger.log(`设置全局API前缀: /${apiPrefix}`, 'Bootstrap');

  // 全局异常过滤器 
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Timestamp',
      'Accept',
      'X-Requested-With'
    ],
    credentials: true,
  });
  // Swagger 配置 - 在 Lambda 中需要特殊处理
  logger.log(`Swagger条件检查: isLambda=${isLambda}, ENABLE_SWAGGER=${process.env.ENABLE_SWAGGER}`, 'Bootstrap');
  if (!isLambda || process.env.ENABLE_SWAGGER === 'true') {
    try {
      logger.log('正在设置 Swagger 文档...', 'Bootstrap');
      
      const config = new DocumentBuilder()
        .setTitle('Web3 University API')
        .setDescription('Web3去中心化教育平台API文档')
        .setVersion('1.0')
        .addServer(
          isLambda 
            ? `https://${process.env.API_GATEWAY_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.NODE_ENV || 'dev'}`
            : `http://localhost:${process.env.PORT || 8051}`,
          isLambda ? `${process.env.NODE_ENV || 'dev'} API` : 'Development API'
        )
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
      
      // Lambda 环境下的 Swagger 设置
      if (isLambda) {
        // 在 Lambda 中，直接在根路径设置 Swagger
        SwaggerModule.setup('api-docs', app, document, {
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
          },
          customSiteTitle: 'Web3 University API',
          customCss: '.swagger-ui .topbar { display: none }',
        });
        
        // 提供 JSON 文档端点
        // 由于 app 不是原生 express 实例，需通过 getHttpAdapter().getInstance() 获取 express 实例
        const httpAdapter = app.getHttpAdapter();
        const expressApp = httpAdapter.getInstance();
        expressApp.get('/api-docs-json', (req, res) => {
          res.json(document);
        });
        
        logger.log('Swagger 文档已设置在 /api-docs 路径', 'Bootstrap');
      } else {
        // 本地开发环境
        SwaggerModule.setup(apiPrefix, app, document, {
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
          },
          customSiteTitle: 'Web3 University API - Development',
        });
        
        logger.log(`Swagger 文档已设置在 /${apiPrefix} 路径`, 'Bootstrap');
      }
      
      logger.log('Swagger 文档设置完成', 'Bootstrap');
      
    } catch (error) {
      logger.error('设置 Swagger 文档时出错:', error.message, 'Bootstrap');
      if (!isLambda) {
        throw error; // 本地开发环境抛出错误
      }
      // Lambda 环境中记录错误但继续运行
    }
  } else {
    logger.log('Lambda 环境下跳过 Swagger 设置 (ENABLE_SWAGGER!=true)', 'Bootstrap');
  }

  if (!isLambda) {
    // 本地开发环境
    const port = process.env.PORT || 8051;
    await app.listen(port);
    
    logger.log(`🚀 应用程序运行在 http://localhost:${port}`, 'Bootstrap');
    logger.log(`📚 API文档地址: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
    logger.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
    logger.log(`🔗 API前缀: /${apiPrefix}`, 'Bootstrap');
  } else {
    // Lambda 环境
    await app.init();
    logger.log(`🚀 Lambda函数已初始化`, 'Bootstrap');
    logger.log(`📚 API文档地址: /api-docs (如果启用)`, 'Bootstrap');
    logger.log(`🌐 环境: ${process.env.NODE_ENV || 'production'}`, 'Bootstrap');
    logger.log(`🔗 API前缀: /${apiPrefix}`, 'Bootstrap');
  }

  return app;
}
bootstrap();

// 导出 bootstrap 函数供 Lambda 使用
export default bootstrap;