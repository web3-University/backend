# Web3大学后端API接口文档

## 项目概述

Web3大学是一个完全去中心化的Web3教育平台，基于区块链技术构建。用户通过Web3钱包登录，使用YD币支付课程费用，获得NFT证书。所有数据存储在Storacha IPFS上，课程和证书都通过智能合约管理，实现真正的去中心化教育。

## 技术栈

- **框架**: NestJS
- **数据库**: PostgreSQL + TypeORM
- **包管理器**: pnpm
- **API文档**: Swagger
- **认证**: Web3钱包签名验证
- **区块链**: Ethereum
- **存储**: Storacha IPFS (去中心化存储)
- **支付**: YD币
- **证书**: NFT (ERC-721)
- **Web3库**: wagmi (React Hooks for Ethereum)

## 项目结构

```
src/
├── modules/
│   ├── user/           # 用户管理模块
│   ├── auth/           # 认证模块
│   ├── course/         # 课程管理模块
│   ├── lesson/         # 课时管理模块
│   ├── storage/        # Web3存储模块
│   ├── certificate/    # NFT证书模块
│   ├── payment/        # YD币支付模块
│   ├── notification/   # 通知模块
│   ├── community/      # 社区模块
│   └── admin/          # 管理员模块
```

## 开发计划

### 第一阶段：基础功能

1. ✅ 用户管理模块
2. 🔄 认证模块
3. 📋 课程管理模块
4. 📋 课时管理模块
5. 📋 Web3存储模块

### 第二阶段：核心功能

1. 📋 NFT证书模块
2. 📋 YD币支付模块
3. 📋 通知模块

### 第三阶段：高级功能

1. 📋 社区模块
2. 📋 管理员模块

## 部署说明

### 环境要求

- Node.js 18+
- PostgreSQL 13+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制 `env.example` 到 `.env` 并配置：

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=web3_university

# 签名验证配置
SIGNATURE_TIMEOUT=300000 # 5分钟签名有效期（毫秒）

# IPFS存储配置
# 选择存储方式：simple (免费) 或 storacha (需要钱包认证)
STORAGE_TYPE=simple
IPFS_GATEWAY=https://ipfs.io
STORACHA_GATEWAY=https://w3s.link

# YD币合约配置
YD_TOKEN_CONTRACT=0x... # YD币合约地址
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id

# NFT证书合约配置
NFT_CERTIFICATE_CONTRACT=0x... # NFT证书合约地址
```

### 如果想使用docker

docker-compose up -d
**使用 Docker 启动 PostgreSQL 和 Redis 服务：**
**PostgreSQL（端口：5432）Redis（端口：6379）**
**数据将持久化存储在 `localStoreData/` 目录下。**

### 运行项目

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### API文档

启动项目后访问：`http://localhost:3000/api` 查看Swagger API文档

## 注意事项

1. **Web3安全性**：所有API都需要钱包签名验证，确保去中心化安全
2. **数据验证**：使用class-validator进行请求数据验证
3. **错误处理**：统一的错误处理机制
4. **日志记录**：记录所有重要操作和区块链交易
5. **性能优化**：使用数据库索引和查询优化
6. **区块链集成**：
   - 支持YD币支付
   - NFT证书铸造和管理
   - Storacha IPFS去中心化存储
   - 智能合约交互
7. **去中心化特性**：
   - 用户通过钱包地址标识
   - 所有重要数据上链存储
   - 支持NFT证书转移和交易
   - 课程内容存储在Storacha IPFS
8. **Gas费优化**：合理设计智能合约，减少Gas消耗
9. **多链支持**：后续可扩展支持Polygon、BSC等链

## 实体设计分析报告

### 📊 原始实体设计问题分析

#### ❌ 主要问题

1. **缺少Web3核心字段**：原始设计缺少`walletAddress`等Web3去中心化平台必需字段
2. **实体关系不完整**：缺少NFT证书、支付记录、学习进度等核心实体
3. **字段设计不符合Web3特性**：缺少价格、分类、IPFS存储等字段
4. **数据类型选择不当**：价格字段应使用字符串存储大数

#### ✅ 改进后的实体设计

### 🏗️ 核心实体结构

#### 1. User实体（用户）

```typescript
- walletAddress: string (主要标识符)
- username: string
- email?: string
- role: 'student' | 'instructor' | 'admin'
- isVerified: boolean
- nonce?: string (签名验证)
- 学习统计字段
```

#### 2. Teacher实体（讲师）

```typescript
- walletAddress: string
- specializations?: string[]
- level: 'junior' | 'senior' | 'expert'
- rating: number
- socialLinks?: object
```

#### 3. Course实体（课程）

```typescript
- instructorWallet: string
- category: string
- level: 'beginner' | 'intermediate' | 'advanced'
- price: string (YD币价格)
- priceInUSD: number
- nftContract?: string
- isOnChain: boolean
- resources?: object
```

#### 4. Lesson实体（课时）

```typescript
- courseId: number
- videoUrl?: string (IPFS链接)
- videoCid?: string
- type: 'video' | 'text' | 'quiz' | 'assignment'
- status: 'draft' | 'published' | 'archived'
```

#### 5. NFTCertificate实体（NFT证书）

```typescript
- tokenId: string
- contractAddress: string
- walletAddress: string
- metadata: string (IPFS链接)
- image: string (IPFS链接)
- transactionHash: string
```

#### 6. Payment实体（支付记录）

```typescript
- courseId: number
- walletAddress: string
- amount: string (YD币数量)
- transactionHash: string
- status: 'pending' | 'confirmed' | 'failed' | 'refunded'
```

#### 7. LearningProgress实体（学习进度）

```typescript
- walletAddress: string
- courseId: number
- lessonId: number
- status: 'not_started' | 'in_progress' | 'completed'
- completionPercentage: number
```

#### 8. Notification实体（通知）

```typescript
- walletAddress: string
- type: 'course_update' | 'payment_success' | 'certificate_minted'
- priority: 'low' | 'medium' | 'high' | 'urgent'
- isRead: boolean
```

### 🔗 实体关系设计

```
User (1) ←→ (N) Course
User (1) ←→ (N) NFTCertificate
User (1) ←→ (N) Payment
User (1) ←→ (N) LearningProgress
User (1) ←→ (N) Notification

Course (1) ←→ (N) Lesson
Course (1) ←→ (N) NFTCertificate
Course (1) ←→ (N) Payment
Course (1) ←→ (N) LearningProgress

Teacher (1) ←→ (N) Course (通过instructorWallet字段关联)
```

### 📝 设计决策说明

#### 为什么不需要Teacher_Course关联表？

1. **一对一关系**：每个课程只有一个主要讲师
2. **简化查询**：直接在Course表中存储讲师信息，避免JOIN查询
3. **性能优化**：减少数据库查询复杂度
4. **Web3特性**：钱包地址作为唯一标识，无需额外关联
5. **数据冗余合理**：讲师姓名和头像在Course表中冗余存储，提高查询效率

### 🎯 设计优势

1. **Web3原生支持**：所有实体都支持钱包地址作为主要标识符
2. **去中心化存储**：使用IPFS链接存储视频、图片等资源
3. **区块链集成**：支持NFT证书、YD币支付等区块链功能
4. **完整的学习流程**：从课程购买到证书获得的完整链路
5. **灵活的权限管理**：支持多角色和权限控制
6. **数据完整性**：使用合适的数据类型和约束

## 更新日志

### v1.1.0 (2024-01-15)

- ✅ 重新设计所有实体结构
- ✅ 添加Web3去中心化特性支持
- ✅ 完善实体间关系设计
- ✅ 添加NFT证书、支付、学习进度等核心实体
- ✅ 优化数据类型和字段设计

### v1.0.0 (2024-01-15)

- 初始项目结构
- 用户管理模块基础功能
- API接口设计文档

---

_此文档将根据项目开发进度持续更新_
