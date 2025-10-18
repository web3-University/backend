import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建用户DTO
 * 定义创建用户时需要的字段和验证规则
 */
export class CreateUserDto {
  @ApiProperty({
    description: '钱包地址',
    example: '0x1234567890123456789012345678901234567890'
  })
  @IsNotEmpty({ message: '钱包地址不能为空' })
  @IsString({ message: '钱包地址必须是字符串' })
  walletAddress: string;

  @ApiProperty({
    description: '用户名',
    example: 'testuser',
    minLength: 3,
    maxLength: 20
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'test@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '是否是教师',
    example: false,
    required: false
  })
  @IsOptional()
  @IsEnum([true, false], { message: 'isInstructorRegistered必须是布尔值' })
  isInstructorRegistered?: boolean = false;

  // @ApiProperty({
  //   description: '用户角色',
  //   example: ['student'],
  //   enum: ['student', 'instructor'],
  //   isArray: true,
  //   default: ['student']
  // })
  // @IsOptional()
  // @IsArray({ message: '角色必须是数组' })
  // @IsEnum(['student', 'instructor',"visitor"], { each: true, message: '角色必须是student或instructor或visitor' })
  // roles?: ('student' | 'instructor' | 'visitor')[];

  @ApiProperty({
    description: '头像URL',
    example: 'https://ipfs.io/ipfs/Qm...',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: '头像必须是有效的URL' })
  avatar?: string;

  // 讲师相关字段
  @ApiProperty({
    description: '讲师简介',
    example: '资深区块链开发者',
    required: false
  })
  @IsOptional()
  @IsString({ message: '简介必须是字符串' })
  bio?: string;

  @ApiProperty({
    description: '专业领域',
    example: ['blockchain', 'solidity', 'web3'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: '专业领域必须是数组' })
  @IsString({ each: true, message: '专业领域数组中的每个元素必须是字符串' })
  specializations?: string[];
}
