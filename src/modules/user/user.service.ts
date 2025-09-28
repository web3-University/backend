import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

/**
 * 用户服务类
 * 处理用户相关的业务逻辑（使用模拟数据）
 */
@Injectable()
export class UserService {
 
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}

  /**
   * 创建新用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * 根据钱包地址获取用户
   */
  async findByWalletAddress(address: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { walletAddress: address } });
  }
}
