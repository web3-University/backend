/**
 * Web3存储相关接口定义
 */

export interface UploadResult {
  cid: string; // IPFS内容标识符
  url: string; // 访问URL
  size: number; // 文件大小（字节）
  type: string; // MIME类型
}

export interface UploadOptions {
  name?: string; // 文件名
  type?: string; // MIME类型
  metadata?: Record<string, any>; // 元数据
}

export interface StorageConfig {
  token: string; // Storacha API Token
  gateway: string; // IPFS网关地址
}

export interface FileUpload {
  file: Buffer;
  name: string;
  type: string;
  size: number;
}
