import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NonceRequestDto } from './dto/nonce-request.dto';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

// POST方法默认状态码是201，所以需要添加HttpCode(HttpStatus.OK)，GET请求不需要
export function NonceApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: '获取 Nonce（用于签名）' }),
    ApiBody({ type: NonceRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Nonce 生成成功',
      type: NonceResponseDto,
    }),
    ApiResponse({ status: 400, description: '无效的钱包地址' }),
    ApiResponse({ status: 429, description: '请求过于频繁' }),
  );
}

export function LoginApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: '登录（验证签名）' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: '登录成功',
      type: LoginResponseDto,
    }),
    ApiResponse({ status: 401, description: '签名验证失败' }),
  );
}

export function RefreshTokenApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: '刷新 Access Token' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: 200,
      description: 'Token 刷新成功',
      type: RefreshTokenResponseDto,
    }),
  );
}

export function LogoutApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({ summary: '登出（撤销 Token）' }),
    ApiResponse({ status: 200, description: '登出成功' }),
    ApiResponse({ status: 401, description: '未授权' }),
  );
}

export function GetMeApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '获取当前用户信息' }),
    ApiResponse({ status: 200, description: '获取成功' }),
    ApiResponse({ status: 401, description: '未授权' }),
  );
}

export function GetSessionsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '获取所有活动会话' }),
    ApiResponse({ status: 200, description: '获取成功' }),
    ApiResponse({ status: 401, description: '未授权' }),
  );
}

export function RevokeSessionApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({ summary: '撤销指定会话' }),
    ApiResponse({ status: 200, description: '会话已撤销' }),
    ApiResponse({ status: 401, description: '未授权' }),
    ApiResponse({ status: 404, description: '会话不存在' }),
  );
}

export function LogoutAllApiDoc() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({ summary: '登出所有设备' }),
    ApiResponse({ status: 200, description: '所有会话已撤销' }),
    ApiResponse({ status: 401, description: '未授权' }),
  );
}
