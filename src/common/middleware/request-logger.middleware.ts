import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../services/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers, body } = req;
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`Request started: ${method} ${originalUrl} - ${ip}`, 'HTTP');

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      // 根据状态码选择日志级别
      if (statusCode >= 500) {
        this.logger.error(`Request completed with server error: ${method} ${originalUrl} ${statusCode} ${responseTime}ms`, undefined, 'HTTP');
      } else if (statusCode >= 400) {
        this.logger.warn(`Request completed with client error: ${method} ${originalUrl} ${statusCode} ${responseTime}ms`, 'HTTP');
      } else {
        this.logger.log(`Request completed successfully: ${method} ${originalUrl} ${statusCode} ${responseTime}ms`, 'HTTP');
      }
    });

    next();
  }
}
