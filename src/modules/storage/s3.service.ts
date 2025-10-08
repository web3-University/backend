import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   GetObjectCommand,
// } from '@aws-sdk/client-s3'; // 已移除AWS S3支持
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // 已移除AWS S3支持
// import { createS3Client, s3Config } from './config/s3.config';
import {
  FileType,
  FileUploadResponseDto,
  PresignedUrlResponseDto,
} from './dto/upload.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class S3Service {
  // 临时实现 - AWS S3已移除，需要替换为其他存储方案
  async uploadFile(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    throw new BadRequestException('S3服务已禁用，请配置其他存储方案');
  }

  async deleteFile(key: string): Promise<void> {
    throw new BadRequestException('S3服务已禁用，请配置其他存储方案');
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<PresignedUrlResponseDto> {
    throw new BadRequestException('S3服务已禁用，请配置其他存储方案');
  }

  async getFileUrl(key: string): Promise<string> {
    throw new BadRequestException('S3服务已禁用，请配置其他存储方案');
  }
}