import * as fs from 'fs';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppLoggerService } from '../../common/services/logger.service';
import { getErrorMessage } from '../getErrorMessage';
import { Request, Response } from 'express';

const apiPrefix = process.env.API_PREFIX || 'api';

export const initSwagger = (
  app: INestApplication,
  logger: AppLoggerService,
) => {
  try {
    logger.log('正在设置 Swagger 文档...', 'Bootstrap');

    const config = new DocumentBuilder()
      .setTitle('Web3 University API')
      .setDescription('Web3去中心化教育平台API文档')
      .setVersion('1.0')
      .addServer(
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `http://localhost:${process.env.PORT || 3000}`,
        process.env.VERCEL_URL ? 'Production API' : 'Development API',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // 使用自定义Swagger HTML模板
    const templatePath = path.join(__dirname, 'index.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const customSwaggerHtml = template.replace(
      '{{swaggerDocUrl}}',
      `/${apiPrefix}-json`,
    );

    // 设置自定义HTML路由
    app.getHttpAdapter().get(`/${apiPrefix}`, (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(customSwaggerHtml);
    });

    // 设置JSON文档路由 - 直接提供JSON内容
    app
      .getHttpAdapter()
      .get(`/${apiPrefix}-json`, (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(document);
      });

    logger.log(`Swagger 文档已设置在 /${apiPrefix} 路径`, 'Bootstrap');
    logger.log('Swagger 文档设置完成', 'Bootstrap');
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error('设置 Swagger 文档时出错:', errorMessage, 'Bootstrap');
    throw error;
  }
};
