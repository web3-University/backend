import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: '章节标题',
    example: '第一章：区块链基础概念',
  })
  @IsNotEmpty({ message: '章节标题不能为空' })
  @IsString({ message: '章节标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '章节描述',
    example: '介绍区块链的基本概念和原理',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '章节描述必须是字符串' })
  description?: string;

  @ApiProperty({
    description: '视频URL',
    example: 'https://ipfs.io/ipfs/Qm...',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '视频URL必须是有效的URL' })
  videoUrl?: string;

  @ApiProperty({
    description: '视频时长（秒）',
    example: 1800,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '视频时长必须是数字' })
  duration?: number;

  @ApiProperty({
    description: '章节顺序',
    example: 1,
  })
  @IsNotEmpty({ message: '章节顺序不能为空' })
  @IsNumber({}, { message: '章节顺序必须是数字' })
  order: number;

  @ApiProperty({
    description: '章节类型',
    example: 'video',
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
  })
  @IsNotEmpty({ message: '章节类型不能为空' })
  @IsEnum(['video', 'text', 'quiz', 'assignment', 'live'], {
    message: '章节类型必须是video、text、quiz、assignment或live',
  })
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live';

  @ApiProperty({
    description: '是否免费预览',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '是否免费预览必须是布尔值' })
  isFreePreview?: boolean;

  @ApiProperty({
    description: '课程ID',
    example: 1,
  })
  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsNumber({}, { message: '课程ID必须是数字' })
  courseId: number;

  @ApiProperty({
    description: '讲师钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty({ message: '讲师钱包地址不能为空' })
  @IsString({ message: '讲师钱包地址必须是字符串' })
  instructorWallet: string;

  @ApiProperty({
    description: '学习目标',
    example: ['理解区块链概念', '掌握基本术语'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '学习目标必须是数组' })
  @IsString({ each: true, message: '学习目标数组中的每个元素必须是字符串' })
  objectives?: string[];

  @ApiProperty({
    description: '前置条件（章节ID数组）',
    example: [1, 2],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '前置条件必须是数组' })
  @IsNumber({}, { each: true, message: '前置条件数组中的每个元素必须是数字' })
  prerequisites?: number[];

  @ApiProperty({
    description: '章节标签',
    example: ['基础', '概念'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '章节标签必须是数组' })
  @IsString({ each: true, message: '章节标签数组中的每个元素必须是字符串' })
  tags?: string[];
}
