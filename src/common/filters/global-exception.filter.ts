import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../services/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(process.env.NODE_ENV === 'development' && { stack: exception instanceof Error ? exception.stack : undefined }),
    };

    // 记录错误日志
    if (status >= 500) {
      this.logger.error(`Server error occurred: ${request.method} ${request.url} ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined, 'Exception');
    } else {
      this.logger.warn(`Client error occurred: ${request.method} ${request.url} ${status} - ${message}`, 'Exception');
    }

    response.status(status).json(errorResponse);
  }
}
