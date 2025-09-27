
import { Entity, Column } from 'typeorm';
import { CommonEntity } from 'src/common/entities/Common.entity';

@Entity()
export class User extends CommonEntity {
  // Web3核心字段 - 钱包地址作为主要标识符
  @Column({ unique: true })
  walletAddress: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email?: string;

  // 头像存储在IPFS上
  @Column({ nullable: true })
  avatar?: string;

  // 用户角色：学生、讲师、管理员
  @Column({ type: 'enum', enum: ['student', 'instructor', 'admin'], default: 'student' })
  role: 'student' | 'instructor' | 'admin';

  // 用于签名验证的随机数
  @Column({ nullable: true })
  nonce?: string;

  // 用户状态
  @Column({ default: true })
  isActive: boolean;


  // NFT证书数量
  @Column({ default: 0 })
  nftCertificates: number;
}