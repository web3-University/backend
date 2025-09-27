import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * 应用程序启动入口
 * 配置全局中间件和管道
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道 - 自动验证请求数据
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 只允许DTO中定义的属性
    forbidNonWhitelisted: true, // 禁止未定义的属性
    transform: true, // 自动转换类型
  }));

  // 启用CORS - 允许跨域请求
  app.enableCors();

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('Web3 后端 API')
    .setDescription('Web3后端项目的API文档')
    .setVersion('1.0')
    .addTag('users', '用户相关接口')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 应用程序运行在 http://localhost:${port}`);
  console.log(`📚 API文档地址: http://localhost:${port}/api`);
}

bootstrap();
