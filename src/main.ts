import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLoggerService } from './common/services/logger.service';

let app: any;

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
  try {
    logger.log('正在设置 Swagger 文档...', 'Bootstrap');

    const config = new DocumentBuilder()
      .setTitle('Web3 University API')
      .setDescription('Web3去中心化教育平台API文档')
      .setVersion('1.0')
      .addServer(
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`,
        process.env.VERCEL_URL ? 'Production API' : 'Development API',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // 使用自定义Swagger HTML模板
    const swaggerDocUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`}/${apiPrefix}-json`;

    const customSwaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Web3 University API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <link rel="icon" href="https://unpkg.com/swagger-ui-dist@4.15.5/favicon-32x32.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '${swaggerDocUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true
      });
    };
  </script>
</body>
</html>`;

    // 设置自定义HTML路由
    app.getHttpAdapter().get(`/${apiPrefix}`, (req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(customSwaggerHtml);
    });

    // 设置JSON文档路由 - 直接提供JSON内容
    app.getHttpAdapter().get(`/${apiPrefix}-json`, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.json(document);
    });

    logger.log(`Swagger 文档已设置在 /${apiPrefix} 路径`, 'Bootstrap');
    logger.log('Swagger 文档设置完成', 'Bootstrap');
  } catch (error) {
    logger.error('设置 Swagger 文档时出错:', error.message, 'Bootstrap');
    throw error;
  }

  // 在Vercel环境中不启动服务器
  if (process.env.VERCEL) {
    logger.log('🚀 应用程序在Vercel环境中运行', 'Bootstrap');
    logger.log(`📚 API文档地址: https://${process.env.VERCEL_URL}/${apiPrefix}`, 'Bootstrap');
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
  logger.log(
    `🌐 环境: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
  logger.log(`🔗 API前缀: /${apiPrefix}`, 'Bootstrap');

  return app;
}

// Vercel无服务器函数导出
export default async (req: any, res: any) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};

// 本地开发环境启动
if (!process.env.VERCEL) {
  bootstrap();
}
