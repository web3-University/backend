# Vercel 部署配置指南

## 🚀 部署到 Vercel

### 1. 准备工作

#### 安装 Vercel CLI
```bash
npm i -g vercel
# 或者
pnpm add -g vercel
```

#### 登录 Vercel
```bash
vercel login
```

### 2. 项目配置

#### 构建配置
项目已经配置了以下构建脚本：
- `vercel:build`: 构建 NestJS 应用
- `vercel:dev`: 开发模式启动
- `vercel:start`: 生产模式启动

#### Vercel 配置文件
`vercel.json` 已创建，包含：
- Node.js 运行时配置
- 路由配置
- 函数超时设置
- 区域配置（香港、新加坡）

### 3. 环境变量设置

在 Vercel Dashboard 中设置以下环境变量：

#### 数据库配置
```
DATABASE_HOST=your_database_host
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database_name
```

#### JWT 配置
```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

#### Redis 配置
```
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

#### 邮件配置
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

#### Pinata IPFS 配置
```
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

#### Web3 配置
```
WEB3_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
WEB3_PRIVATE_KEY=your_private_key
```

#### 应用配置
```
APP_PORT=3000
APP_ENV=production
APP_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

### 4. 部署步骤

#### 方法1: 使用 Vercel CLI
```bash
# 在项目根目录执行
vercel

# 首次部署
vercel --prod

# 后续部署
vercel --prod
```

#### 方法2: 连接 GitHub
1. 在 Vercel Dashboard 中导入 GitHub 仓库
2. 设置构建命令：`pnpm run vercel:build`
3. 设置输出目录：`dist`
4. 设置启动命令：`pnpm run vercel:start`

### 5. 数据库配置

#### 推荐使用 Vercel Postgres
```bash
# 安装 Vercel Postgres
vercel addons create vercel-postgres
```

#### 或使用外部数据库
- Supabase
- PlanetScale
- Railway
- Neon

### 6. Redis 配置

#### 推荐使用 Upstash Redis
```bash
# 安装 Upstash Redis
vercel addons create upstash-redis
```

### 7. 文件存储

由于移除了 AWS S3，建议使用：
- Vercel Blob Storage
- Cloudinary
- Uploadcare
- 或重新配置其他云存储服务

### 8. 部署后验证

#### 检查部署状态
```bash
vercel ls
vercel inspect [deployment-url]
```

#### 测试 API 端点
```bash
curl https://your-app.vercel.app/api/health
```

### 9. 监控和日志

#### Vercel Analytics
- 在 Vercel Dashboard 中启用
- 监控性能指标
- 查看错误日志

#### 自定义日志
```typescript
// 在代码中使用 Winston 记录日志
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  
  someMethod() {
    this.logger.log('Application started');
  }
}
```

### 10. 性能优化

#### 启用 Edge Functions
```json
{
  "functions": {
    "dist/main.js": {
      "maxDuration": 30,
      "regions": ["hkg1", "sin1"]
    }
  }
}
```

#### 缓存配置
```typescript
// 在 NestJS 中配置缓存
@Controller()
export class AppController {
  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  getHello() {
    return 'Hello World!';
  }
}
```

### 11. 故障排除

#### 常见问题
1. **构建失败**: 检查 Node.js 版本和依赖
2. **环境变量**: 确保所有必需的环境变量已设置
3. **数据库连接**: 检查数据库连接字符串
4. **CORS 错误**: 配置正确的 CORS 源

#### 调试命令
```bash
# 查看部署日志
vercel logs [deployment-url]

# 本地调试
vercel dev
```

### 12. 迁移完成

✅ **已移除的 AWS SAM 配置**:
- `.samignore` 文件
- `.aws-sam/` 目录
- AWS SDK 依赖

✅ **已添加的 Vercel 配置**:
- `vercel.json` 配置文件
- Vercel 构建脚本
- 部署说明文档

### 13. 下一步

1. 设置环境变量
2. 配置数据库和 Redis
3. 部署到 Vercel
4. 测试 API 功能
5. 配置监控和日志

---

**注意**: 部署前请确保所有环境变量都已正确配置，特别是数据库连接和 JWT 密钥。
