import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { verifyMessage } from 'ethers';
import { SiweMessage } from 'siwe';

/**
 * Web3 签名验证服务
 * 负责验证以太坊钱包签名
 */
@Injectable()
export class Web3VerifyService {
  private readonly logger = new Logger(Web3VerifyService.name);

  /**
   * 验证以太坊签名（使用 ethers.js）
   * @param message 原始消息
   * @param signature 签名
   * @param expectedAddress 期望的钱包地址
   * @returns 是否验证成功
   */
  verifySignature(
    message: string,
    signature: string,
    expectedAddress: string,
  ): boolean {
    try {
      // 使用 ethers.js 恢复签名者地址
      const recoveredAddress = verifyMessage(message, signature);

      // 比较地址（不区分大小写）
      const isValid =
        recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

      if (!isValid) {
        this.logger.warn(
          `签名验证失败: 期望地址 ${expectedAddress}, 恢复地址 ${recoveredAddress}`,
        );
      }

      return isValid;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`签名验证异常: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 验证 SIWE（Sign-In with Ethereum）消息
   * @param message SIWE 格式的消息
   * @param signature 签名
   * @returns SIWE 消息对象
   */
  async verifySiweMessage(
    message: string,
    signature: string,
  ): Promise<SiweMessage> {
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      // 验证时间有效性
      if (fields.data.expirationTime) {
        const expirationTime = new Date(fields.data.expirationTime);
        if (expirationTime < new Date()) {
          throw new UnauthorizedException('消息已过期');
        }
      }

      return fields.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`SIWE 消息验证失败: ${errorMessage}`);
      throw new UnauthorizedException('签名验证失败');
    }
  }

  /**
   * 生成 SIWE 格式的消息
   * @param domain 域名
   * @param address 钱包地址
   * @param nonce 随机数
   * @param chainId 链 ID
   * @returns SIWE 格式的消息
   */
  generateSiweMessage(
    domain: string,
    address: string,
    nonce: string,
    chainId: number = 1,
    origin?: string,
  ): string {
    const issuedAt = new Date().toISOString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5分钟后过期

    // 清理 domain，移除协议前缀
    let cleanDomain = domain.replace(/^https?:\/\//, '');

    // 如果提供了 origin，从中提取 domain 和 port
    if (origin) {
      try {
        const url = new URL(origin);
        // 使用实际访问的 host（包含端口）
        cleanDomain = url.host; // 例如：127.0.0.1:5500
      } catch {
        this.logger.warn(`无法解析 origin: ${origin}`);
      }
    }

    const message = new SiweMessage({
      domain: cleanDomain,
      address,
      statement: 'Sign in to Web3 University',
      uri: origin || `http://${cleanDomain}`,
      version: '1',
      chainId,
      nonce,
      issuedAt,
      expirationTime,
    });

    const preparedMessage = message.prepareMessage();

    // 记录生成的消息用于调试
    this.logger.debug(
      `生成的 SIWE 消息 (domain: ${cleanDomain}):\n${preparedMessage}`,
    );

    return preparedMessage;
  }

  /**
   * 验证地址格式
   * @param address 钱包地址
   * @returns 是否为有效的以太坊地址
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}
