import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

// 检查是否在Lambda环境中
const isLambda = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint(),
  ),
  defaultMeta: { service: 'web3-university-api' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          const contextStr = context ? `[${context}]` : '';
          const traceStr = trace ? `\n${trace}` : '';
          return `${timestamp} ${level} ${contextStr} ${message} ${JSON.stringify(meta)}${traceStr}`;
        }),
      ),
    }),
    
    // 只在非Lambda环境中使用文件输出
    ...(isLambda ? [] : [
      // 文件输出 - 所有日志
      new winston.transports.File({
        dirname: 'logs',
        filename: 'combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      
      // 文件输出 - 错误日志
      new winston.transports.File({
        dirname: 'logs',
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ]),
  ],
  
  // 异常处理 - 只在非Lambda环境中使用文件
  exceptionHandlers: isLambda ? [] : [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  
  // 未捕获的Promise拒绝 - 只在非Lambda环境中使用文件
  rejectionHandlers: isLambda ? [] : [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
};
