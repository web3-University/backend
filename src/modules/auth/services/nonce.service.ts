import { Injectable, Logger } from '@nestjs/common';
// import Redis from 'ioredis'; // Redis支持已禁用
import { randomBytes } from 'crypto';

/**
 * Nonce 管理服务
 * Redis支持已禁用，使用内存存储（仅用于测试）
 */
@Injectable()
export class NonceService {
  private readonly logger = new Logger(NonceService.name);
  // private readonly redis: Redis; // Redis支持已禁用
  private readonly NONCE_PREFIX = 'nonce:';
  private readonly NONCE_TTL = 5 * 60; // 5分钟（秒）
  private readonly nonceStore = new Map<string, { timestamp: number; used: boolean }>(); // 内存存储

  constructor() {
    // Redis支持已禁用
    this.logger.warn('⚠️ Redis支持已禁用，使用内存存储（仅用于测试）');
    
    // 清理过期的nonce（每5分钟）
    setInterval(() => {
      this.cleanupExpiredNonces();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期的nonce
   */
  private cleanupExpiredNonces() {
    const now = Date.now();
    for (const [key, value] of this.nonceStore.entries()) {
      if (now - value.timestamp > this.NONCE_TTL * 1000) {
        this.nonceStore.delete(key);
      }
    }
  }

  /**
   * 生成唯一的 Nonce
   * @param walletAddress 钱包地址
   * @returns Nonce 字符串
   */
  async generateNonce(walletAddress: string): Promise<string> {
    const nonce = randomBytes(16).toString('hex');
    const key = this.getNonceKey(walletAddress, nonce);

    // 存储到内存，设置过期时间
    this.nonceStore.set(key, {
      timestamp: Date.now(),
      used: false
    });

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
    const value = this.nonceStore.get(key);

    if (!value) {
      this.logger.warn(`Nonce 不存在或已过期: ${nonce}`);
      return false;
    }

    if (value.used) {
      this.logger.warn(`Nonce 已被使用: ${nonce}`);
      return false;
    }

    // 标记为已使用
    value.used = true;

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
    const value = this.nonceStore.get(key);
    return value ? !value.used : false;
  }

  /**
   * 清除指定地址的所有 Nonce
   * @param walletAddress 钱包地址
   */
  async clearNonces(walletAddress: string): Promise<void> {
    const pattern = `${this.NONCE_PREFIX}${walletAddress}:`;
    let count = 0;
    
    for (const key of this.nonceStore.keys()) {
      if (key.startsWith(pattern)) {
        this.nonceStore.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(
        `已清除地址 ${walletAddress} 的 ${count} 个 Nonce`,
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
   * 关闭连接（在应用关闭时调用）
   */
  async onModuleDestroy() {
    // Redis支持已禁用，无需关闭连接
    this.logger.log('NonceService 已关闭');
  }
}
