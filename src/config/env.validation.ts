import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, validateSync } from 'class-validator';

export class EnvironmentVariables {
  // 数据库配置
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  // Pinata IPFS配置
  @IsString()
  @IsOptional()
  PINATA_JWT_TOKEN?: string;

  @IsString()
  @IsOptional()
  PINATA_GATEWAY_DOMAIN?: string;

  @IsString()
  @IsOptional()
  PINATA_UPLOAD_URL?: string;

  @IsString()
  @IsOptional()
  PINATA_FILE_URL?: string;

  // 应用配置
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  PORT?: number = 3000;

  @IsString()
  @IsOptional()
  NODE_ENV?: string = 'development';

  @IsString()
  @IsOptional()
  API_PREFIX?: string = 'api';

  // CORS配置
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string = '*';

  // Web3配置
  @IsString()
  @IsOptional()
  ETHEREUM_RPC_URL?: string;

  @IsString()
  @IsOptional()
  YD_TOKEN_CONTRACT?: string;

  @IsString()
  @IsOptional()
  NFT_CERTIFICATE_CONTRACT?: string;

  // 签名验证配置
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  SIGNATURE_TIMEOUT?: number = 300000; // 5分钟

  // 存储配置
  @IsString()
  @IsOptional()
  STORAGE_TYPE?: string = 'simple';

  @IsString()
  @IsOptional()
  IPFS_GATEWAY?: string = 'https://ipfs.io';

  @IsString()
  @IsOptional()
  STORACHA_GATEWAY?: string = 'https://w3s.link';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => 
      Object.values(error.constraints || {}).join(', ')
    ).join('; ');
    
    throw new Error(`Configuration validation error: ${errorMessages}`);
  }
  
  return validatedConfig;
}
