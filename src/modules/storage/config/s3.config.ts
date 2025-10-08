// import { S3Client } from '@aws-sdk/client-s3'; // 已移除AWS S3支持

/**
 * AWS S3 配置 - 已禁用
 * 需要替换为其他存储方案，如：
 * - Vercel Blob Storage
 * - Cloudinary
 * - Uploadcare
 * - 或其他云存储服务
 */
export const s3Config = {
  // AWS 区域
  region: process.env.AWS_REGION || 'us-east-1',

  // AWS 访问密钥ID
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',

  // AWS 秘密访问密钥
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',

  // S3 存储桶名称
  bucketName: process.env.AWS_S3_BUCKET_NAME || '',

  // 文件上传路径前缀
  uploadPrefix: process.env.AWS_S3_UPLOAD_PREFIX || 'uploads/',

  // 允许的文件类型
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // 最大文件大小 (字节)
  maxFileSize: 10 * 1024 * 1024, // 10MB

  // 预签名URL过期时间 (秒)
  presignedUrlExpiration: 3600, // 1小时
};

/**
 * 创建S3客户端 - 已禁用
 * @returns S3Client实例
 */
export function createS3Client(): any {
  throw new Error('S3服务已禁用，请配置其他存储方案');
  
  // 原始实现已注释
  // return new S3Client({
  //   region: s3Config.region,
  //   credentials: {
  //     accessKeyId: s3Config.accessKeyId,
  //     secretAccessKey: s3Config.secretAccessKey,
  //   },
  // });
}