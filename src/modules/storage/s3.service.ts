import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, s3Config } from './config/s3.config';
import {
  FileType,
  FileUploadResponseDto,
  PresignedUrlResponseDto,
} from './dto/upload.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    try {
      this.s3Client = createS3Client();
    } catch (error) {
      console.error('❌ S3 客户端创建失败:', error.message);
      // 不抛出错误，允许服务启动，但在实际使用时会报错
    }
  }

  /**
   * 生成唯一的文件键名
   */
  private generateFileKey(fileType: FileType, fileName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    // 根据文件类型选择路径前缀
    const pathPrefix = s3Config.upload.pathPrefix[fileType] || 'documents/';
    // 生成唯一文件名
    const uniqueFileName = `${baseName}-${timestamp}-${randomString}${extension}`;

    return `${pathPrefix}${uniqueFileName}`;
  }

  /**
   * 验证文件类型和大小
   */
  private validateFile(file: Express.Multer.File): void {
    // 检查文件大小
    if (file.size > s3Config.upload.maxFileSize) {
      throw new BadRequestException(
        `文件大小超过限制，最大允许 ${s3Config.upload.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // 检查文件类型
    if (!s3Config.upload.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}。支持的类型: ${s3Config.upload.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * 上传文件到S3
   */
  async uploadFile(
    file: Express.Multer.File,
    fileType: FileType,
  ): Promise<FileUploadResponseDto> {
    try {
      console.log('🚀 开始上传文件:', {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        s3FileType: fileType,
      });

      this.validateFile(file);

      // 检查AWS配置
      if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
        throw new Error('AWS凭证未配置');
      }

      // 生成文件键名
      const key = this.generateFileKey(fileType, file.originalname);

      // 创建上传命令
      const uploadCommand = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // 设置为公开读取
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      // 执行上传
      await this.s3Client.send(uploadCommand);
      // 生成文件访问URL
      const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

      return {
        url: fileUrl,
        key,
        size: file.size,
        contentType: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ S3上传失败:', {
        error: error.message,
        stack: error.stack,
        fileName: file?.originalname,
        fileSize: file?.size,
      });

      if (error.message.includes('AWS凭证未配置')) {
        throw new BadRequestException('AWS凭证未配置，请检查环境变量');
      }

      if (error.message.includes('NoSuchBucket')) {
        throw new BadRequestException('S3存储桶不存在');
      }

      if (error.message.includes('AccessDenied')) {
        throw new BadRequestException('AWS访问权限不足');
      }

      throw new InternalServerErrorException(`文件上传失败: ${error.message}`);
    }
  }

  /**
   * 生成预签名上传URL
   */
  async generatePresignedUploadUrl(
    fileType: FileType,
    fileName: string,
    contentType: string,
    userId?: string,
    expiresIn: number = 3600,
  ): Promise<PresignedUrlResponseDto> {
    try {
      // 验证文件类型
      if (!s3Config.upload.allowedMimeTypes.includes(contentType)) {
        throw new BadRequestException(
          `不支持的文件类型: ${contentType}。支持的类型: ${s3Config.upload.allowedMimeTypes.join(', ')}`,
        );
      }

      // 生成文件键名
      const key = this.generateFileKey(fileType, fileName);

      // 创建上传命令
      const uploadCommand = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      // 生成预签名URL
      const uploadUrl = await getSignedUrl(this.s3Client, uploadCommand, {
        expiresIn,
      });
      console.log(uploadUrl, 'uploadUrl');

      // 生成文件访问URL
      const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
      console.log(fileUrl, 'fileUrl');
      return {
        uploadUrl,
        fileUrl,
        key,
        expiresIn,
      };
    } catch (error) {
      console.error('生成预签名URL失败:', error);
      throw new InternalServerErrorException('生成上传URL失败');
    }
  }

  /**
   * 删除S3中的文件
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('S3删除文件失败:', error);
      throw new InternalServerErrorException('文件删除失败');
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    fileType: FileType,
  ): Promise<FileUploadResponseDto[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, fileType));
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('批量上传失败:', error);
      throw new InternalServerErrorException('批量文件上传失败');
    }
  }
}
