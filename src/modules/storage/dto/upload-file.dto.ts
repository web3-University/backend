import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 文件上传DTO
 */
export class UploadFileDto {
  @ApiPropertyOptional({ description: '文件名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'MIME类型' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '存储类型', enum: ['simple'], default: 'simple' })
  @IsOptional()
  @IsEnum(['simple'])
  storageType?: 'simple';

  @ApiPropertyOptional({ description: '文件元数据' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * 批量上传DTO
 */
export class BatchUploadDto {
  @ApiProperty({ description: '文件列表' })
  files: UploadFileDto[];
}
