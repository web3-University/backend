import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isVercel = process.env.VERCEL === '1';

// 本地开发环境的控制台格式
const localConsoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}] ` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
  }),
);

// Vercel环境的控制台格式
const vercelConsoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const winstonConfig: WinstonModuleOptions = {
  level: isDevelopment ? 'debug' : 'info',
  
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  defaultMeta: {
    service: 'web3-university-api',
    environment: process.env.NODE_ENV || 'development',
  },

  transports: [
    // 控制台输出 - 在Vercel环境中使用JSON格式
    new winston.transports.Console({
      format: isVercel ? vercelConsoleFormat : localConsoleFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    
    // 只在非Vercel环境中使用文件日志
    ...(isVercel ? [] : [
      // 所有日志
      new winston.transports.File({
        filename: 'logs/combined.log',
        level: 'debug',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
      
      // 错误日志
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
      
      // 异常和拒绝日志
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        handleExceptions: true,
        handleRejections: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
    ]),
  ],
  
  // 异常和拒绝处理
  handleExceptions: true,
  handleRejections: true,
  
  // 退出时刷新日志
  exitOnError: false,
};