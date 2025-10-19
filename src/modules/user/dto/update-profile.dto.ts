import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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
    description: '个人简介',
    example: 'Web3 爱好者',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
