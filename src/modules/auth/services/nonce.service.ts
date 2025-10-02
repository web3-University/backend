import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';

/**
 * Nonce 管理服务
 * 使用 Redis 存储和验证 Nonce，防止重放攻击
 */
@Injectable()
export class NonceService {
  private readonly logger = new Logger(NonceService.name);
  private readonly redis: Redis;
  private readonly NONCE_PREFIX = 'nonce:';
  private readonly NONCE_TTL = 5 * 60; // 5分钟（秒）

  constructor() {
    // 初始化 Redis 客户端
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis 连接成功');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`❌ Redis 连接错误: ${error.message}`);
    });
  }

  /**
   * 生成唯一的 Nonce
   * @param walletAddress 钱包地址
   * @returns Nonce 字符串
   */
  async generateNonce(walletAddress: string): Promise<string> {
    const nonce = randomBytes(16).toString('hex');
    const key = this.getNonceKey(walletAddress, nonce);

    // 存储到 Redis，设置过期时间
    await this.redis.setex(key, this.NONCE_TTL, 'unused');

    this.logger.debug(`为地址 ${walletAddress} 生成 Nonce: ${nonce}`);
    return nonce;
  }

  /**
   * 验证并消费 Nonce（确保只能使用一次）
   * @param walletAddress 钱包地址
   * @param nonce Nonce 字符串
   * @returns 是否验证成功
   */
  async validateAndConsumeNonce(
    walletAddress: string,
    nonce: string,
  ): Promise<boolean> {
    const key = this.getNonceKey(walletAddress, nonce);

    // 获取 Nonce 状态
    const value = await this.redis.get(key);

    if (!value) {
      this.logger.warn(`Nonce 不存在或已过期: ${nonce}`);
      return false;
    }

    if (value === 'used') {
      this.logger.warn(`Nonce 已被使用: ${nonce}`);
      return false;
    }

    // 标记为已使用（仍保留到过期，避免重放）
    await this.redis.setex(key, this.NONCE_TTL, 'used');

    this.logger.debug(`Nonce 验证成功并已消费: ${nonce}`);
    return true;
  }

  /**
   * 检查 Nonce 是否存在且未使用
   * @param walletAddress 钱包地址
   * @param nonce Nonce 字符串
   * @returns 是否有效
   */
  async isNonceValid(walletAddress: string, nonce: string): Promise<boolean> {
    const key = this.getNonceKey(walletAddress, nonce);
    const value = await this.redis.get(key);
    return value === 'unused';
  }

  /**
   * 清除指定地址的所有 Nonce
   * @param walletAddress 钱包地址
   */
  async clearNonces(walletAddress: string): Promise<void> {
    const pattern = `${this.NONCE_PREFIX}${walletAddress}:*`;
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.debug(
        `已清除地址 ${walletAddress} 的 ${keys.length} 个 Nonce`,
      );
    }
  }

  /**
   * 获取 Nonce 的 Redis Key
   * @param walletAddress 钱包地址
   * @param nonce Nonce 字符串
   * @returns Redis Key
   */
  private getNonceKey(walletAddress: string, nonce: string): string {
    return `${this.NONCE_PREFIX}${walletAddress}:${nonce}`;
  }

  /**
   * 关闭 Redis 连接（在应用关闭时调用）
   */
  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis 连接已关闭');
  }
}
