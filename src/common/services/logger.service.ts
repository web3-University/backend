import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger;
  constructor() {
    const isVercel = process.env.VERCEL === '1';
    
    this.logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
      transports: [
        new transports.Console(),
        // 只在非Vercel环境中使用文件日志
        ...(isVercel ? [] : [
          // 文件输出
          new transports.File({
            filename: 'logs/combined.log',
              format: format.combine(
                format.timestamp(),
                format.json()
              ),
            }),
            new transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: format.combine(
                format.timestamp(),
                format.json()
              ),
            }),
            new transports.File({
              filename: 'logs/exceptions.log',
              level: 'error',
              format: format.combine(
                format.timestamp(),
                format.json()
              ),
            }),
            new transports.File({
              filename: 'logs/rejections.log',
              level: 'error',
              format: format.combine(
                format.timestamp(),
                format.json()
              ),
            }),
        ]),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(`[${context || 'App'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(`[${context || 'App'}] ${message}`, trace);
  }

  warn(message: string, context?: string) {
    this.logger.warn(`[${context || 'App'}] ${message}`);
  }

  debug(message: string, context?: string) {
    this.logger.debug(`[${context || 'App'}] ${message}`);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(`[${context || 'App'}] ${message}`);
  }
}
