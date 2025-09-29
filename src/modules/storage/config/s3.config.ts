import { S3Client } from '@aws-sdk/client-s3';

/**
 * AWS S3 配置
 */
export const s3Config = {
  // AWS 区域
  region: process.env.AWS_REGION || 'us-east-1',

  // AWS 访问密钥ID
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,

  // AWS 秘密访问密钥
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  // S3 存储桶名称
  bucketName: process.env.AWS_S3_BUCKET_NAME,

  // 文件上传配置
  upload: {
    // 最大文件大小 (10MB)
    maxFileSize: 10 * 1024 * 1024,

    // 允许的文件类型
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
      'application/json',
    ],

    // 文件存储路径前缀
    pathPrefix: {
      avatars: 'avatars/',
      courses: 'courses/',
      lessons: 'lessons/',
      certificates: 'certificates/',
      documents: 'documents/',
    },
  },
};

/**
 * 创建S3客户端实例
 */
export const createS3Client = (): S3Client => {
  if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
    console.warn('⚠️  AWS 凭证未配置，S3 功能将不可用');
    console.warn('请设置以下环境变量:');
    console.warn('- AWS_ACCESS_KEY_ID');
    console.warn('- AWS_SECRET_ACCESS_KEY');
    console.warn('- AWS_S3_BUCKET_NAME');
    console.warn('- AWS_REGION (可选，默认 us-east-1)');
    
    // 返回一个模拟的客户端，实际使用时会报错
    throw new Error(
      'AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.',
    );
  }

  if (!s3Config.bucketName) {
    throw new Error(
      'AWS S3 bucket name is not configured. Please set AWS_S3_BUCKET_NAME environment variable.',
    );
  }

  return new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
};
