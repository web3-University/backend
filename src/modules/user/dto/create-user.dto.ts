import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建用户DTO
 * 定义创建用户时需要的字段和验证规则
 */
export class CreateUserDto {
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
    example: 'test@example.com' 
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ 
    description: '密码', 
    example: '123456',
    minLength: 6
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;
}
