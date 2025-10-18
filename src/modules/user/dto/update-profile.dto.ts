import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

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
  @IsUrl()
  avatar?: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '邮箱验证码，四位数字',
    example: '1234',
  })
  @IsString()
  @Length(4, 4)
  verificationCode: string;
}
