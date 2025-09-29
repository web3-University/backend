import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

// 检查是否在Lambda环境中
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Lambda 环境下的控制台格式（结构化JSON，便于CloudWatch解析）
const lambdaConsoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(typeof context === 'object' && context !== null
        ? { context }
        : context
        ? { context: String(context) }
        : {}),
      ...(typeof trace === 'object' && trace !== null
        ? { trace }
        : trace
        ? { trace: String(trace) }
        : {}),
      ...(meta && typeof meta === 'object' ? meta : {}),
    };
    return JSON.stringify(logObject);
  })
);

// 本地开发环境下的控制台格式
const localConsoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const traceStr = trace ? `\n${trace}` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${metaStr}${traceStr}`;
  })
);

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // 默认元数据
  defaultMeta: { 
    service: 'web3-university-api',
    environment: process.env.NODE_ENV || 'development',
    ...(isLambda && {
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      region: process.env.AWS_REGION,
    })
  },
  
  transports: [
    // 控制台输出 - 根据环境选择格式
    new winston.transports.Console({
      format: isLambda ? lambdaConsoleFormat : localConsoleFormat,
      handleExceptions: false, // 让 Lambda 处理异常
      handleRejections: false, // 让 Lambda 处理拒绝
    }),
    
    // Lambda 环境下的临时文件输出（可选，用于调试）
    ...(isLambda && isDevelopment ? [
      new winston.transports.File({
        filename: '/tmp/app.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 2,
        tailable: true,
      }),
    ] : []),
    
    // 本地开发环境的文件输出
    ...(isLambda ? [] : [
      // 所有日志
      new winston.transports.File({
        dirname: 'logs',
        filename: 'combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
      
      // 错误日志
      new winston.transports.File({
        dirname: 'logs',
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
    ]),
  ],
  
  // 异常和拒绝处理 - Lambda 环境下禁用文件处理
  ...(isLambda ? {
    // Lambda 环境下不处理异常和拒绝，让 Lambda 运行时处理
    handleExceptions: false,
    handleRejections: false,
    exitOnError: false,
  } : {
    // 本地环境下的异常处理
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({ 
        filename: 'logs/exceptions.log',
        maxsize: 5242880,
        maxFiles: 3,
      }),
    ],
    
    rejectionHandlers: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({ 
        filename: 'logs/rejections.log',
        maxsize: 5242880,
        maxFiles: 3,
      }),
    ],
    handleExceptions: true,
    handleRejections: true,
    exitOnError: false,
  }),
};