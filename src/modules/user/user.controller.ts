import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 创建新用户
   */
  @Post()
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  } 

  /**
   * 获取所有用户
   */
  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * 根据ID获取用户
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(+id);
  }
}
