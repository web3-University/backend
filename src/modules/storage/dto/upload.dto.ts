import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * 文件类型枚举
 */
export enum FileType {
  AVATAR = 'avatar',
  COURSE_COVER = 'course_cover',
  LESSON_VIDEO = 'lesson_video',
  LESSON_DOCUMENT = 'lesson_document',
  CERTIFICATE = 'certificate',
  DOCUMENT = 'document',
}

/**
 * 上传文件DTO
 */
export class UploadFileDto {
  @ApiProperty({
    description: '文件类型',
    enum: FileType,
    example: FileType.AVATAR,
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({
    description: '文件名称',
    example: 'avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    description: '文件描述',
    example: '用户头像',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 生成预签名URL DTO
 */
export class GeneratePresignedUrlDto {
  @ApiProperty({
    description: '文件类型',
    enum: FileType,
    example: FileType.COURSE_COVER,
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({
    description: '文件名称',
    example: 'course-cover.jpg',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '文件MIME类型',
    example: 'image/jpeg',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 1024000,
  })
  fileSize: number;
}

/**
 * 文件上传响应DTO
 */
export class FileUploadResponseDto {
  @ApiProperty({
    description: '文件键名',
    example: 'avatars/user-123.jpg',
  })
  key: string;

  @ApiProperty({
    description: '上传时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  uploadedAt: Date;
  @ApiProperty({
    description: '文件URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg',
  })
  url: string;
}

/**
 * 预签名URL响应DTO
 */
export class PresignedUrlResponseDto {
  @ApiProperty({
    description: '预签名上传URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg?...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: '文件访问URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg',
  })
  fileUrl: string;

  @ApiProperty({
    description: '文件键名',
    example: 'avatars/user-123.jpg',
  })
  key: string;

  @ApiProperty({
    description: '过期时间（秒）',
    example: 3600,
  })
  expiresIn: number;
}
