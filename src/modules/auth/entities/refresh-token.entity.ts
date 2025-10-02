import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Refresh Token 实体
 * 用于管理用户的刷新令牌和会话
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  walletAddress: string;

  @Column({ unique: true })
  @Index()
  tokenId: string; // JWT 的 jti (JWT ID)

  @Column({ type: 'text' })
  deviceInfo: string; // 设备信息（User-Agent）

  @Column()
  ipAddress: string; // IP 地址

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date; // 最后使用时间

  @Column({ default: true })
  isActive: boolean; // 是否激活（用于管理会话）
}
