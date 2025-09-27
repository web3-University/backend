import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map(data => {
        // 如果数据已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 否则包装成标准格式
        return {
          success: true,
          data,
          message: 'Success',
          timestamp: new Date().toISOString(),
          statusCode,
        };
      })
    );
  }
}
