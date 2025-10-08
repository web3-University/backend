import { z } from 'zod';

// 环境变量校验Schema - 根据实际.env配置
const envSchema = z.object({
  // 数据库配置
  DB_HOST: z.string().min(1, { message: 'DB_HOST 不能为空' }),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),
  DB_USERNAME: z.string().min(1, { message: 'DB_USERNAME 不能为空' }),
  DB_PASSWORD: z.string().min(1, { message: 'DB_PASSWORD 不能为空' }),
  DB_DATABASE: z.string().min(1, { message: 'DB_DATABASE 不能为空' }),

  // Pinata IPFS配置（可选）
  PINATA_JWT_TOKEN: z.string().optional(),
  PINATA_GATEWAY_DOMAIN: z.string().optional(),
  PINATA_UPLOAD_URL: z.url().optional(),
  PINATA_FILE_URL: z.url().optional(),

  // 应用配置
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),
  API_PREFIX: z.string().min(1).default('api'),

  // JWT 配置
  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET 不能为空' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1, { message: 'JWT_REFRESH_SECRET 不能为空' }),

  // Redis 配置（用于 Nonce 管理）- 已禁用
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z
    .string()
    .default('6379')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(15))
    .optional(),

  // Web3 Auth 配置
  APP_DOMAIN: z.string().min(1, { message: 'APP_DOMAIN 不能为空' }),
});

// 导出类型
export type EnvironmentVariables = z.infer<typeof envSchema>;

// 校验函数
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        })
        .join('; ');

      throw new Error(`Configuration validation error: ${errorMessages}`);
    }
    throw error;
  }
}
