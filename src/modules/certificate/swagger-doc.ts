import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

import { NFTCertificate } from './entities/nft-certificate.entity';

export function CreateCertificateApiDoc() {
  return applyDecorators(
    ApiBody({
      description: '创建证书',
      schema: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: '用户钱包地址',
            example: '0x1234567890123456789012345678901234567890',
          },
          courseId: {
            type: 'number',
            description: '课程ID',
            example: 1,
          },
        },
        required: ['walletAddress', 'courseId'],
      },
    }),
    ApiResponse({
      status: 201,
      description: '证书创建成功',
      type: NFTCertificate,
    }),
    ApiResponse({ status: 404, description: '用户或课程不存在' }),
    ApiResponse({ status: 400, description: '该用户已经拥有此课程的证书' }),
  );
}

export function getUserCertificatesApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '获取用户的证书列表' }),
    ApiQuery({
      name: 'walletAddress',
      required: true,
      description: '用户钱包地址',
    }),
    ApiResponse({
      status: 200,
      description: '获取证书列表成功',
      type: [NFTCertificate],
    }),
    ApiResponse({ status: 404, description: '用户不存在' }),
  );
}
