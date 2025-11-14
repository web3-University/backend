import { S3Client } from '@aws-sdk/client-s3';

const normalizeEnv = (value?: string | null): string => {
  if (!value) return '';
  let sanitized = value.trim();

  if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
    sanitized = sanitized.slice(1, -1);
  }

  if (sanitized.startsWith("'") && sanitized.endsWith("'")) {
    sanitized = sanitized.slice(1, -1);
  }

  if (sanitized.endsWith(';')) {
    sanitized = sanitized.slice(0, -1);
  }

  return sanitized.trim();
};

export const s3Config = {
  region: normalizeEnv(process.env.AWS_REGION) || 'us-east-1',
  accessKeyId: normalizeEnv(process.env.AWS_ACCESS_KEY_ID),
  secretAccessKey: normalizeEnv(process.env.AWS_SECRET_ACCESS_KEY),
  bucketName: normalizeEnv(process.env.AWS_S3_BUCKET_NAME),
  uploadPrefix: normalizeEnv(process.env.AWS_S3_UPLOAD_PREFIX) || 'uploads/',
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
  maxFileSize: 1024 * 1024 * 1024,
};

function ensureValue(name: string, value: string): void {
  if (!value) {
    throw new Error(`S3 配置缺失，请检查环境变量 ${name}`);
  }
}

export function validateS3Config(): void {
  ensureValue('AWS_ACCESS_KEY_ID', s3Config.accessKeyId);
  ensureValue('AWS_SECRET_ACCESS_KEY', s3Config.secretAccessKey);
  ensureValue('AWS_S3_BUCKET_NAME', s3Config.bucketName);
}

export function createS3Client(): S3Client {
  console.log('🚀 最终用于 S3Client 的 Region =', s3Config.region);
  console.log('🚀 最终用于 S3Client 的 AccessKey =', s3Config.accessKeyId);
  console.log('🚀 最终用于 S3Client 的 Bucket =', s3Config.bucketName);
  validateS3Config();
  return new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
}
