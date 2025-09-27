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

## API接口设计

### 1. 用户管理模块 (User Module)
**基础路径**: `/api/users`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| POST | `/register` | 用户注册 | 通过钱包地址注册 |
| GET | `/list` | 获取用户列表 | 获取所有用户（管理员） |
| GET | `/profile` | 获取用户详情 | 通过钱包地址获取用户信息 |
| POST | `/update` | 更新用户信息 | 更新用户资料 |
| POST | `/delete` | 删除用户 | 删除用户账户 |
| POST | `/avatar` | 上传头像 | 上传用户头像 |
| GET | `/stats` | 获取用户统计 | 通过钱包地址获取学习统计信息 |

**请求/响应示例**:
```typescript
// 用户注册（通过钱包地址）
POST /api/users/register
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "username": "web3learner",
  "email": "user@example.com",
  "signature": "0x...", // 钱包签名
  "message": "Web3 University Registration"
}

// 获取用户详情（通过钱包地址）
GET /api/users/profile?walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

// 用户统计（通过钱包地址）
GET /api/users/stats?walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "totalCourses": 5,
  "completedCourses": 3,
  "totalLessons": 50,
  "completedLessons": 35,
  "certificates": 2,
  "studyHours": 120,
  "nftCertificates": ["0x...", "0x..."] // NFT证书合约地址
}
```

### 2. 认证模块 (Auth Module)
**基础路径**: `/api/auth`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| POST | `/wallet-login` | 钱包登录 | Web3钱包签名登录（主要登录方式） |
| POST | `/wallet-register` | 钱包注册 | 通过钱包地址注册 |
| POST | `/logout` | 用户登出 | 退出登录 |
| POST | `/verify-signature` | 验证签名 | 验证钱包签名有效性 |
| GET | `/verify-wallet` | 验证钱包 | 验证钱包地址和签名 |
| POST | `/bind-email` | 绑定邮箱 | 绑定邮箱到钱包地址 |

**请求/响应示例**:
```typescript
// 钱包登录（主要登录方式）
POST /api/auth/wallet-login
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "signature": "0x...",
  "message": "Web3 University Login",
  "timestamp": 1642234567890
}

// 响应
{
  "success": true,
  "message": "登录成功",
  "user": {
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "username": "web3learner",
    "email": "user@example.com",
    "isVerified": true
  }
}

// 钱包注册
POST /api/auth/wallet-register
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "signature": "0x...",
  "message": "Web3 University Registration",
  "username": "web3learner",
  "email": "user@example.com"
}

// 验证钱包
GET /api/auth/verify-wallet?walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6&signature=0x...
```

### 3. 课程管理模块 (Course Module)
**基础路径**: `/api/courses`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/list` | 获取课程列表 | 分页获取课程 |
| GET | `/detail` | 获取课程详情 | 通过课程ID获取详情 |
| POST | `/create` | 创建课程 | 创建新课程（讲师/管理员） |
| POST | `/update` | 更新课程 | 更新课程信息 |
| POST | `/delete` | 删除课程 | 删除课程 |
| GET | `/category` | 按分类获取 | 按分类获取课程 |
| GET | `/search` | 搜索课程 | 搜索课程 |
| GET | `/featured` | 推荐课程 | 获取推荐课程 |
| GET | `/trending` | 热门课程 | 获取热门课程 |
| POST | `/like` | 点赞课程 | 点赞/取消点赞 |
| GET | `/lessons` | 获取课时列表 | 获取课程下的所有课时 |

**请求/响应示例**:
```typescript
// 创建课程
POST /api/courses/create
{
  "title": "Solidity智能合约开发",
  "description": "从零开始学习Solidity智能合约开发",
  "category": "blockchain",
  "level": "beginner",
  "price": 1000, // YD币价格
  "priceInUSD": 99.99,
  "duration": 30, // 天数
  "thumbnail": "https://w3s.link/ipfs/Qm...", // web3.storage IPFS存储
  "tags": ["solidity", "smart-contract", "ethereum"],
  "instructorWallet": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "nftContract": "0x...", // 课程NFT合约地址
  "signature": "0x..." // 讲师签名
}

// 课程详情
GET /api/courses/detail?id=1
{
  "id": 1,
  "title": "Solidity智能合约开发",
  "description": "详细描述...",
  "instructor": {
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "username": "SolidityMaster",
    "avatar": "https://w3s.link/ipfs/Qm..."
  },
  "category": "blockchain",
  "level": "beginner",
  "price": 1000, // YD币
  "priceInUSD": 99.99,
  "duration": 30,
  "thumbnail": "https://w3s.link/ipfs/Qm...",
  "rating": 4.8,
  "studentCount": 1250,
  "nftContract": "0x...", // 课程NFT合约
  "isOnChain": true, // 是否已上链
  "lessons": [
    {
      "id": 1,
      "title": "Solidity基础语法",
      "duration": 45,
      "isFree": true,
      "videoUrl": "https://w3s.link/ipfs/Qm..." // web3.storage IPFS视频链接
    }
  ]
}

// 搜索课程
GET /api/courses/search?keyword=solidity&category=blockchain&level=beginner&page=1&limit=10
```

### 4. 课时管理模块 (Lesson Module)
**基础路径**: `/api/lessons`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/list` | 获取课时列表 | 通过课程ID获取课时列表 |
| GET | `/detail` | 获取课时详情 | 通过课时ID获取详情 |
| POST | `/create` | 创建课时 | 创建新课时 |
| POST | `/update` | 更新课时 | 更新课时信息 |
| POST | `/delete` | 删除课时 | 删除课时 |
| POST | `/upload-video` | 上传视频 | 上传课时视频到IPFS |
| POST | `/upload-material` | 上传资料 | 上传课时资料到IPFS |
| GET | `/progress` | 获取学习进度 | 获取用户在该课时的进度 |

**请求/响应示例**:
```typescript
// 创建课时
POST /api/lessons/create
{
  "courseId": 1,
  "title": "Solidity基础语法",
  "description": "学习Solidity的基本语法",
  "duration": 45, // 分钟
  "order": 1,
  "isFree": true,
  "videoUrl": "video_url",
  "materials": ["material1.pdf", "material2.pdf"]
}
```

### 5. Web3存储模块 (Storage Module)
**基础路径**: `/api/storage`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| POST | `/upload` | 上传文件 | 上传单个文件到IPFS |
| POST | `/upload/batch` | 批量上传 | 批量上传文件到IPFS |
| POST | `/upload/json` | 上传JSON | 上传JSON数据到IPFS |
| GET | `/info` | 获取文件信息 | 通过CID获取文件信息 |
| GET | `/url` | 生成URL | 生成IPFS访问URL |
| GET | `/validate` | 验证CID | 验证CID格式 |

**请求/响应示例**:
```typescript
// 上传单个文件
POST /api/storage/upload
Content-Type: multipart/form-data
{
  "file": "file_data",
  "name": "course-video.mp4",
  "type": "video/mp4",
  "metadata": {
    "courseId": 1,
    "lessonId": 1
  }
}

// 响应
{
  "cid": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  "url": "https://w3s.link/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  "size": 1024000,
  "type": "video/mp4"
}

// 上传JSON数据
POST /api/storage/upload/json
{
  "name": "Solidity智能合约开发证书",
  "description": "完成Solidity智能合约开发课程",
  "attributes": [
    {"trait_type": "课程", "value": "Solidity智能合约开发"},
    {"trait_type": "分数", "value": "95"}
  ]
}

// 生成IPFS URL
GET /api/storage/url?cid=QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx&filename=video.mp4
{
  "url": "https://w3s.link/ipfs/QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/video.mp4"
}
```

### 6. NFT证书模块 (NFT Certificate Module)
**基础路径**: `/api/certificates`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/user-nfts` | 获取用户NFT证书 | 通过钱包地址获取NFT证书 |
| GET | `/nft-detail` | 获取NFT证书详情 | 通过NFT ID获取详情 |
| POST | `/mint` | 铸造NFT证书 | 课程完成后铸造NFT证书 |
| GET | `/verify` | 验证NFT证书 | 验证NFT证书真实性 |
| POST | `/transfer` | 转移NFT证书 | 转移NFT证书所有权 |
| GET | `/blockchain-verify` | 区块链验证 | 通过合约地址验证NFT |

**请求/响应示例**:
```typescript
// 铸造NFT证书
POST /api/certificates/mint
{
  "courseId": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "completionDate": "2024-01-15T10:30:00Z",
  "score": 95,
  "metadata": {
    "name": "Solidity智能合约开发证书",
    "description": "完成Solidity智能合约开发课程",
    "image": "https://w3s.link/ipfs/Qm...", // web3.storage IPFS证书图片
    "attributes": [
      {"trait_type": "课程", "value": "Solidity智能合约开发"},
      {"trait_type": "分数", "value": "95"},
      {"trait_type": "完成时间", "value": "2024-01-15"}
    ]
  },
  "signature": "0x..." // 钱包签名
}

// NFT证书详情
GET /api/certificates/nft-detail?nftId=1&walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
{
  "nftId": 1,
  "tokenId": "12345",
  "contractAddress": "0x...", // NFT合约地址
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "courseTitle": "Solidity智能合约开发",
  "completionDate": "2024-01-15T10:30:00Z",
  "score": 95,
  "metadata": "https://w3s.link/ipfs/Qm...", // web3.storage IPFS元数据
  "image": "https://w3s.link/ipfs/Qm...", // web3.storage IPFS证书图片
  "isVerified": true,
  "isTransferable": true // 是否可转移
}
```

### 7. YD币支付模块 (YD Token Payment Module)
**基础路径**: `/api/payments`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| POST | `/create-payment` | 创建支付 | 创建YD币支付订单 |
| POST | `/verify-payment` | 验证支付 | 验证YD币交易 |
| GET | `/payment-status` | 查询支付状态 | 查询支付状态 |
| POST | `/refund` | 申请退款 | 申请课程退款 |
| GET | `/user-payments` | 获取支付记录 | 通过钱包地址获取支付记录 |
| POST | `/yd-payment` | YD币支付 | 使用YD币支付课程 |

**请求/响应示例**:
```typescript
// 创建YD币支付订单
POST /api/payments/create-payment
{
  "courseId": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": 1000, // YD币
  "amountInUSD": 99.99,
  "currency": "YD",
  "tokenContract": "0x...", // YD币合约地址
  "gasPrice": "20000000000", // wei
  "gasLimit": "100000"
}

// 验证YD币支付
POST /api/payments/verify-payment
{
  "courseId": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "transactionHash": "0x...",
  "amount": 1000, // YD币
  "blockNumber": 12345678,
  "signature": "0x..."
}

// YD币支付
POST /api/payments/yd-payment
{
  "courseId": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": 1000, // YD币
  "currency": "YD",
  "tokenContract": "0x...", // YD币合约地址
  "transactionHash": "0x...",
  "blockNumber": 12345678,
  "gasUsed": "100000",
  "gasPrice": "20000000000"
}
```

### 8. 通知模块 (Notification Module)
**基础路径**: `/api/notifications`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/user-notifications` | 获取通知列表 | 通过钱包地址获取用户通知 |
| POST | `/mark-read` | 标记已读 | 标记通知为已读 |
| POST | `/mark-all-read` | 全部已读 | 标记所有通知为已读 |
| POST | `/delete` | 删除通知 | 删除通知 |
| POST | `/send` | 发送通知 | 发送通知给用户 |
| GET | `/unread-count` | 未读数量 | 通过钱包地址获取未读通知数量 |

**请求/响应示例**:
```typescript
// 发送通知
POST /api/notifications/send
{
  "userId": 1,
  "title": "课程更新通知",
  "message": "您报名的课程有新内容更新",
  "type": "course_update",
  "data": {
    "courseId": 1,
    "lessonId": 5
  }
}
```

### 9. 社区模块 (Community Module)
**基础路径**: `/api/community`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/posts` | 获取帖子列表 | 获取社区帖子 |
| POST | `/posts` | 发布帖子 | 发布新帖子 |
| GET | `/post-detail` | 获取帖子详情 | 通过帖子ID获取详情 |
| POST | `/update-post` | 更新帖子 | 更新帖子内容 |
| POST | `/delete-post` | 删除帖子 | 删除帖子 |
| POST | `/like-post` | 点赞帖子 | 点赞/取消点赞 |
| POST | `/comment-post` | 评论帖子 | 评论帖子 |
| GET | `/post-comments` | 获取评论 | 获取帖子评论 |
| GET | `/tags` | 获取标签 | 获取热门标签 |

**请求/响应示例**:
```typescript
// 发布帖子
POST /api/community/posts
{
  "title": "Solidity学习心得",
  "content": "分享一些学习Solidity的经验...",
  "tags": ["solidity", "learning"],
  "courseId": 1 // 可选，关联课程
}
```

### 10. 管理员模块 (Admin Module)
**基础路径**: `/api/admin`

| 方法 | 路径 | 功能 | 描述 |
|------|------|------|------|
| GET | `/dashboard` | 管理面板 | 获取管理面板数据 |
| GET | `/users` | 用户管理 | 获取所有用户 |
| POST | `/update-user-status` | 用户状态 | 启用/禁用用户 |
| GET | `/courses` | 课程管理 | 获取所有课程 |
| POST | `/approve-course` | 课程审核 | 审核课程 |
| GET | `/payments` | 支付管理 | 获取支付记录 |
| GET | `/statistics` | 统计数据 | 获取平台统计数据 |
| POST | `/announcements` | 发布公告 | 发布平台公告 |

**请求/响应示例**:
```typescript
// 管理面板数据
GET /api/admin/dashboard
{
  "totalUsers": 1500,
  "totalCourses": 50,
  "totalRevenue": 25000,
  "monthlyGrowth": 15.5,
  "recentEnrollments": [
    {
      "userId": 1,
      "courseId": 1,
      "enrolledAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 数据库设计

### 主要实体关系
- **User** (用户) 1:N **Course** (课程)
- **Course** (课程) 1:N **Lesson** (课时)
- **User** (用户) 1:N **NFTCertificate** (NFT证书)
- **Course** (课程) 1:N **NFTCertificate** (NFT证书)
- **User** (用户) 1:N **Payment** (支付记录)

### 核心实体字段
```typescript
// User实体（Web3去中心化）
interface User {
  id: number;
  walletAddress: string; // 主要标识符
  username: string;
  email?: string; // 可选
  firstName?: string;
  lastName?: string;
  avatar?: string; // web3.storage IPFS链接
  role: 'student' | 'instructor' | 'admin';
  isVerified: boolean; // 钱包验证状态
  nonce: string; // 用于签名验证
  createdAt: Date;
  updatedAt: Date;
}

// Course实体（支持NFT）
interface Course {
  id: number;
  title: string;
  description: string;
  instructorWallet: string; // 讲师钱包地址
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string; // YD币价格（BigNumber）
  priceInUSD: number;
  duration: number; // 天数
  thumbnail: string; // web3.storage IPFS链接
  tags: string[];
  rating: number;
  studentCount: number;
  nftContract?: string; // NFT合约地址
  isOnChain: boolean; // 是否已上链
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// NFT证书实体
interface NFTCertificate {
  id: number;
  tokenId: string;
  contractAddress: string;
  walletAddress: string;
  courseId: number;
  courseTitle: string;
  completionDate: Date;
  score: number;
  metadata: string; // web3.storage IPFS元数据链接
  image: string; // web3.storage IPFS图片链接
  transactionHash: string; // 铸造交易哈希
  blockNumber: number;
  isVerified: boolean;
  createdAt: Date;
}

// 支付记录实体
interface Payment {
  id: number;
  courseId: number;
  walletAddress: string;
  amount: string; // YD币数量
  amountInUSD: number;
  currency: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}
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

*此文档将根据项目开发进度持续更新*
