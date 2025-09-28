const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('./app.module');
const serverless = require('serverless-http');
const express = require('express');

// 创建Express应用实例
const expressApp = express();

// 全局变量用于缓存应用实例
let nestApp;
let cachedHandler;
let isBootstrapping = false;
let logger;

// 添加健康检查端点
expressApp.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    lambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME
  });
});

async function bootstrap() {
  try {
    // 防止并发初始化
    if (isBootstrapping) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (nestApp && !isBootstrapping) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      });
      return nestApp;
    }

    // 如果已经初始化，直接返回
    if (nestApp) {
      return nestApp;
    }

    isBootstrapping = true;
    
    // 在 Lambda 环境中确保临时目录存在（如果需要文件日志）
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      try {
        const fs = require('fs');
        // 确保 /tmp 目录可写（通常已经存在）
        if (!fs.existsSync('/tmp')) {
          fs.mkdirSync('/tmp', { recursive: true });
        }
      } catch (error) {
        console.warn('Failed to check /tmp directory:', error.message);
      }
    }
    
    console.log('Initializing NestJS application in Lambda environment...');
    
    // 记录初始化开始时间
    const startTime = Date.now();
    
    // 创建Express适配器
    const adapter = new ExpressAdapter(expressApp);
    
    // 创建NestJS应用
    nestApp = await NestFactory.create(AppModule, adapter, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['log', 'error', 'warn', 'debug'],
      abortOnError: false,
      bufferLogs: true,
      autoFlushLogs: true,
    });

    // 获取 Winston Logger 实例
    try {
      const { WINSTON_MODULE_PROVIDER } = require('nest-winston');
      const winstonLogger = nestApp.get(WINSTON_MODULE_PROVIDER);
      logger = winstonLogger;
    } catch (error) {
      console.warn('Winston logger not available, using console');
      logger = console;
    }

    // 启用CORS
    nestApp.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || true
        : true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept',
        'X-Requested-With',
        'X-Amz-Date',
        'X-Api-Key',
        'X-Amz-Security-Token'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
    });

    // 设置全局前缀
    if (process.env.API_PREFIX) {
      nestApp.setGlobalPrefix(process.env.API_PREFIX);
    }

    // Swagger 配置 - Lambda环境
    if (process.env.ENABLE_SWAGGER === 'true') {
      try {
        console.log('正在设置 Swagger 文档...');
        
        const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
        
        const config = new DocumentBuilder()
          .setTitle('Web3 University API')
          .setDescription('Web3去中心化教育平台API文档')
          .setVersion('1.0')
          .addServer(
            `https://${process.env.API_GATEWAY_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.NODE_ENV || 'dev'}`,
            `${process.env.NODE_ENV || 'dev'} API`
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
        
        const document = SwaggerModule.createDocument(nestApp, config);
        
        // 设置Swagger UI
        SwaggerModule.setup('api-docs', nestApp, document, {
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
          },
          customSiteTitle: 'Web3 University API',
          customCss: '.swagger-ui .topbar { display: none }',
        });
        
        // 提供 JSON 文档端点
        const httpAdapter = nestApp.getHttpAdapter();
        const app = httpAdapter.getInstance();
        app.get('/api-docs-json', (req, res) => {
          res.json(document);
        });
        
        console.log('Swagger 文档已设置完成');
        
      } catch (error) {
        console.error('设置 Swagger 文档时出错:', error.message);
        // Lambda 环境中记录错误但继续运行
      }
    } else {
      console.log('Lambda 环境下跳过 Swagger 设置 (ENABLE_SWAGGER!=true)');
    }

    // 启用优雅关闭
    nestApp.enableShutdownHooks();

    // 初始化应用
    await nestApp.init();
    
    const initTime = Date.now() - startTime;
    const logMessage = `NestJS application initialized successfully in ${initTime}ms`;
    
    if (logger && logger.info) {
      logger.info(logMessage, { 
        context: 'Lambda Bootstrap',
        initTime,
        functionName: process.env.AWS_LAMBDA_FUNCTION_NAME 
      });
    } else {
      console.log(logMessage);
    }
    
    isBootstrapping = false;
    return nestApp;
    
  } catch (error) {
    isBootstrapping = false;
    const errorMessage = 'Failed to bootstrap NestJS application';
    
    if (logger && logger.error) {
      logger.error(errorMessage, {
        error: error.message,
        stack: error.stack,
        context: 'Lambda Bootstrap'
      });
    } else {
      console.error(errorMessage, error);
    }
    throw error;
  }
}

// Lambda 处理函数
exports.handler = async (event, context) => {
  // 记录请求开始时间
  const requestStart = Date.now();
  const requestId = context.awsRequestId;
  
  try {
    // 设置上下文以避免 Lambda 等待事件循环为空
    context.callbackWaitsForEmptyEventLoop = false;
    
    // 记录请求信息
    if (logger && logger.info) {
      logger.info('Lambda request received', {
        context: 'Lambda Handler',
        requestId,
        httpMethod: event.httpMethod,
        path: event.path,
        userAgent: event.headers?.['User-Agent'],
        sourceIp: event.requestContext?.identity?.sourceIp,
      });
    }

    // 健康检查快速响应
    if (event.path === '/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          cold_start: !cachedHandler,
          requestId,
          environment: process.env.NODE_ENV,
          api_prefix: process.env.API_PREFIX,
          swagger_enabled: process.env.ENABLE_SWAGGER === 'true'
        })
      };
    }

    // API 信息快速响应
    if (event.path === '/api-info' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Web3 University API',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          endpoints: {
            health: '/health',
            swagger: '/api-docs',
            swaggerJson: '/api-docs-json',
            api: `/${process.env.API_PREFIX || 'api'}`
          },
          requestId
        })
      };
    }
    
    // 初始化应用（只在第一次调用时执行）
    if (!cachedHandler) {
      const coldStart = Date.now();
      await bootstrap();
      
      // 创建 serverless-http 处理器并缓存
      cachedHandler = serverless(expressApp, {
        binary: [
          'image/*',
          'application/pdf',
          'application/zip',
          'application/octet-stream',
          'application/vnd.*',
          'font/*',
          'video/*',
          'audio/*',
        ],
        request(request, event, context) {
          // 添加 AWS 上下文信息到请求对象
          request.apiGateway = { event, context };
          request.lambda = { event, context };
        },
        response(response, event, context) {
          // 确保 CORS 头部存在
          if (!response.headers) response.headers = {};
          response.headers['Access-Control-Allow-Origin'] = '*';
          response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
          response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Accept';
        }
      });
      
      const coldStartTime = Date.now() - coldStart;
      if (logger && logger.info) {
        logger.info('Cold start completed', {
          context: 'Lambda Handler',
          coldStartTime,
          requestId
        });
      } else {
        console.log(`Cold start completed in ${coldStartTime}ms`);
      }
    }
    
    // 执行请求处理
    const result = await cachedHandler(event, context);
    
    // 记录请求处理时间
    const requestTime = Date.now() - requestStart;
    
    if (logger && logger.info) {
      logger.info('Request completed', {
        context: 'Lambda Handler',
        requestId,
        httpMethod: event.httpMethod,
        path: event.path,
        statusCode: result.statusCode,
        requestTime,
        isSlowRequest: requestTime > 5000
      });
    }
    
    if (requestTime > 5000) {
      const warningMessage = `Slow request: ${event.httpMethod} ${event.path} took ${requestTime}ms`;
      if (logger && logger.warn) {
        logger.warn(warningMessage, {
          context: 'Lambda Handler',
          requestId,
          requestTime
        });
      } else {
        console.warn(warningMessage);
      }
    }
    
    return result;
    
  } catch (error) {
    const requestTime = Date.now() - requestStart;
    const errorInfo = {
      context: 'Lambda Handler',
      requestId,
      error: error.message,
      stack: error.stack,
      path: event.path,
      method: event.httpMethod,
      requestTime
    };
    
    if (logger && logger.error) {
      logger.error('Lambda handler error', errorInfo);
    } else {
      console.error('Lambda handler error:', errorInfo);
    }
    
    // 返回结构化错误响应
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong' 
          : error.message,
        timestamp: new Date().toISOString(),
        requestId,
        path: event.path,
        method: event.httpMethod,
      }),
    };
  }
};

// 优雅关闭处理
process.on('SIGTERM', async () => {
  const message = 'SIGTERM received, shutting down gracefully';
  if (logger && logger.info) {
    logger.info(message, { context: 'Process' });
  } else {
    console.log(message);
  }
  
  if (nestApp) {
    try {
      await nestApp.close();
      const successMessage = 'NestJS application closed gracefully';
      if (logger && logger.info) {
        logger.info(successMessage, { context: 'Process' });
      } else {
        console.log(successMessage);
      }
    } catch (error) {
      const errorMessage = 'Error during graceful shutdown';
      if (logger && logger.error) {
        logger.error(errorMessage, { error: error.message, stack: error.stack, context: 'Process' });
      } else {
        console.error(errorMessage, error);
      }
    }
  }
});

// 未处理异常处理
process.on('unhandledRejection', (reason, promise) => {
  const errorInfo = {
    context: 'Process',
    reason: reason,
    promise: promise
  };
  
  if (logger && logger.error) {
    logger.error('Unhandled Rejection', errorInfo);
  } else {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  const errorInfo = {
    context: 'Process',
    error: error.message,
    stack: error.stack
  };
  
  if (logger && logger.error) {
    logger.error('Uncaught Exception', errorInfo);
  } else {
    console.error('Uncaught Exception:', error);
  }
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});