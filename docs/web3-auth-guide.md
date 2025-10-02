# Web3 Auth 模块使用指南

## 📚 目录

- [功能概述](#功能概述)
- [快速开始](#快速开始)
- [API 接口说明](#api-接口说明)
- [前端集成示例](#前端集成示例)
- [安全说明](#安全说明)

---

## 功能概述

Web3 Auth 模块提供基于以太坊钱包签名的认证系统，支持：

✅ **钱包签名登录**（Sign-In with Ethereum, SIWE）
✅ **JWT Token 管理**（Access Token + Refresh Token）
✅ **防重放攻击**（Nonce + 时间戳验证）
✅ **多设备会话管理**
✅ **速率限制**（防止暴力破解）

---

## 快速开始

### 1. 环境变量配置

在 `.env.development` 或 `.env.production` 中添加：

```bash
# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Redis 配置（用于 Nonce 管理）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Web3 Auth 配置
APP_DOMAIN=localhost
```

### 2. 启动 Redis

```bash
# 使用 Docker
docker-compose up -d
```

### 3. 运行数据库迁移

```bash
# RefreshToken 实体会自动同步到数据库
pnpm run dev
```

---

## API 接口说明

### 1️⃣ 获取 Nonce

**请求：**

```http
POST /auth/nonce
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**响应：**

```json
{
  "nonce": "2b5f8d3a9c1234567890abcdef",
  "message": "localhost wants you to sign in with your Ethereum account:\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\nSign in to Web3 University\n\nURI: https://localhost\nVersion: 1\nChain ID: 1\nNonce: 2b5f8d3a9c1234567890abcdef\nIssued At: 2025-10-01T08:00:00.000Z\nExpiration Time: 2025-10-01T08:05:00.000Z",
  "expiresAt": 1696147200
}
```

---

### 2️⃣ 登录（验证签名）

**请求：**

```http
POST /auth/login
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x1234567890abcdef...",
  "message": "localhost wants you to sign in with your Ethereum account:..."
}
```

**响应：**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "username": "User_0x742d35",
    "email": null,
    "avatar": null
  },
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

### 3️⃣ 刷新 Token

**请求：**

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应：**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

### 4️⃣ 获取当前用户信息

**请求：**

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "userId": 1,
  "username": "User_0x742d35"
}
```

---

### 5️⃣ 登出

**请求：**

```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "message": "登出成功"
}
```

---

### 6️⃣ 获取所有活动会话

**请求：**

```http
GET /auth/sessions
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "total": 2,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceInfo": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "ipAddress": "192.168.1.100",
      "createdAt": "2025-10-01T08:00:00.000Z",
      "lastUsedAt": "2025-10-01T09:30:00.000Z",
      "expiresAt": "2025-10-08T08:00:00.000Z"
    }
  ]
}
```

---

### 7️⃣ 撤销指定会话

**请求：**

```http
DELETE /auth/sessions/:sessionId
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "message": "会话已撤销"
}
```

---

### 8️⃣ 登出所有设备

**请求：**

```http
POST /auth/logout-all
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "message": "所有设备已登出"
}
```

---

## 前端集成示例

### React + ethers.js 示例

```typescript
import { ethers } from 'ethers';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * 连接钱包并登录
 */
async function web3Login() {
  try {
    // 1. 连接 MetaMask
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    console.log('钱包地址:', walletAddress);

    // 2. 获取 Nonce
    const { data: nonceData } = await axios.post(`${API_URL}/auth/nonce`, {
      walletAddress,
    });

    console.log('Nonce:', nonceData.nonce);
    console.log('待签名消息:', nonceData.message);

    // 3. 签名消息
    const signature = await signer.signMessage(nonceData.message);

    console.log('签名:', signature);

    // 4. 登录验证
    const { data: loginData } = await axios.post(`${API_URL}/auth/login`, {
      walletAddress,
      signature,
      message: nonceData.message,
    });

    // 5. 保存 Token
    localStorage.setItem('accessToken', loginData.accessToken);
    localStorage.setItem('refreshToken', loginData.refreshToken);

    console.log('登录成功！', loginData.user);
    return loginData;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 自动刷新 Token（在 axios 拦截器中使用）
 */
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 错误且未重试过，则刷新 Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // 更新 Token
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Token 刷新失败，跳转到登录页
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * 配置 axios 默认携带 Token
 */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 登出
 */
async function logout() {
  try {
    await axios.post(`${API_URL}/auth/logout`);
    localStorage.clear();
    console.log('登出成功');
  } catch (error) {
    console.error('登出失败:', error);
  }
}

export { web3Login, logout };
```

---

## 在其他模块中使用认证

### 保护路由示例

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('courses')
export class CourseController {
  /**
   * 需要认证的路由
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  async getMyCourses(@CurrentUser('walletAddress') walletAddress: string) {
    return this.courseService.getUserCourses(walletAddress);
  }

  /**
   * 公开路由（不需要认证）
   */
  @Public()
  @Get('list')
  async getAllCourses() {
    return this.courseService.findAll();
  }
}
```

---

## 安全说明

### 🔒 安全特性

1. **Nonce 机制**：每个 Nonce 只能使用一次，有效期 5 分钟
2. **时间戳验证**：消息包含签发时间和过期时间
3. **JWT 过期管理**：Access Token 15 分钟，Refresh Token 7 天
4. **速率限制**：Nonce 生成接口每分钟最多 10 次请求
5. **Token 撤销**：支持登出和会话管理

### ⚠️ 生产环境建议

1. **使用 HTTPS**：必须使用 HTTPS 传输 Token
2. **强密钥**：JWT_SECRET 和 JWT_REFRESH_SECRET 必须使用强随机密钥
3. **Redis 安全**：生产环境 Redis 必须设置密码
4. **CORS 配置**：限制允许的前端域名
5. **日志监控**：监控异常登录行为

---

## 常见问题

### Q1: Nonce 无效或已过期？

**原因：**

- Nonce 使用后会被标记为已用
- Nonce 有效期只有 5 分钟
- 用户时钟不准确

**解决：**

- 重新获取 Nonce
- 确保前端和后端时间同步

---

### Q2: Token 刷新失败？

**原因：**

- Refresh Token 已过期（7天）
- Refresh Token 已被撤销
- Token 格式错误

**解决：**

- 重新登录获取新 Token
- 检查 Token 是否正确存储

---

### Q3: Redis 连接失败？

**原因：**

- Redis 服务未启动
- Redis 连接配置错误

**解决：**

```bash
# 启动 Redis
docker run -d -p 6379:6379 redis:latest

# 或使用 docker-compose
pnpm run docker:up
```

---

## Token 生命周期

```
用户登录
  ↓
生成 Access Token (15分钟) + Refresh Token (7天)
  ↓
Access Token 过期
  ↓
使用 Refresh Token 刷新
  ↓
生成新的 Access Token + Refresh Token（旧 Refresh Token 失效）
  ↓
Refresh Token 过期或用户登出
  ↓
需要重新登录
```

---

## 测试命令

```bash
# 1. 获取 Nonce
curl -X POST http://localhost:3000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'

# 2. 登录（需要先签名）
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "signature":"0x...",
    "message":"..."
  }'

# 3. 获取用户信息
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 架构图

```
┌─────────────────┐
│   前端 (DApp)    │
│   - MetaMask    │
│   - ethers.js   │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  NestJS Backend │
│  ┌───────────┐  │
│  │Auth Module│  │
│  └───────────┘  │
└────┬──────┬─────┘
     │      │
     ↓      ↓
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
│(用户)  │ │(Nonce) │
└────────┘ └────────┘
```

---

## 相关资源

- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [JWT 最佳实践](https://tools.ietf.org/html/rfc8725)
- [ethers.js 文档](https://docs.ethers.org/)

---

**🎉 Web3 Auth 模块已完成！现在你可以开始构建去中心化应用了！**
