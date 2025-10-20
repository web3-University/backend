import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({
    description: '用户钱包地址',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: '用户名',
    example: 'Web3Learner',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '头像图片URL',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  })
  @IsUrl()
  avatar?: string;

  @ApiProperty({
    description: '个人简介',
    example: 'Web3 爱好者',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '签名串',
    required: false,
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({
    description: '签名消息',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: '消息时间戳',
    example: 1700000000000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  timestamp?: number;
}
