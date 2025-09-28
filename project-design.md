## API接口设计

### 1. 用户管理模块 (User Module)

**基础路径**: `/api/users`

| 方法 | 路径        | 功能         | 描述                         |
| ---- | ----------- | ------------ | ---------------------------- |
| POST | `/register` | 用户注册     | 通过钱包地址注册             |
| GET  | `/list`     | 获取用户列表 | 获取所有用户（管理员）       |
| GET  | `/profile`  | 获取用户详情 | 通过钱包地址获取用户信息     |
| POST | `/update`   | 更新用户信息 | 更新用户资料                 |
| POST | `/delete`   | 删除用户     | 删除用户账户                 |
| POST | `/avatar`   | 上传头像     | 上传用户头像                 |
| GET  | `/stats`    | 获取用户统计 | 通过钱包地址获取学习统计信息 |

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

| 方法 | 路径                | 功能     | 描述                             |
| ---- | ------------------- | -------- | -------------------------------- |
| POST | `/wallet-login`     | 钱包登录 | Web3钱包签名登录（主要登录方式） |
| POST | `/wallet-register`  | 钱包注册 | 通过钱包地址注册                 |
| POST | `/logout`           | 用户登出 | 退出登录                         |
| POST | `/verify-signature` | 验证签名 | 验证钱包签名有效性               |
| GET  | `/verify-wallet`    | 验证钱包 | 验证钱包地址和签名               |
| POST | `/bind-email`       | 绑定邮箱 | 绑定邮箱到钱包地址               |

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

| 方法 | 路径        | 功能         | 描述                      |
| ---- | ----------- | ------------ | ------------------------- |
| GET  | `/list`     | 获取课程列表 | 分页获取课程              |
| GET  | `/detail`   | 获取课程详情 | 通过课程ID获取详情        |
| POST | `/create`   | 创建课程     | 创建新课程（讲师/管理员） |
| POST | `/update`   | 更新课程     | 更新课程信息              |
| POST | `/delete`   | 删除课程     | 删除课程                  |
| GET  | `/category` | 按分类获取   | 按分类获取课程            |
| GET  | `/search`   | 搜索课程     | 搜索课程                  |
| GET  | `/featured` | 推荐课程     | 获取推荐课程              |
| GET  | `/trending` | 热门课程     | 获取热门课程              |
| POST | `/like`     | 点赞课程     | 点赞/取消点赞             |
| GET  | `/lessons`  | 获取课时列表 | 获取课程下的所有课时      |

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

| 方法 | 路径               | 功能         | 描述                   |
| ---- | ------------------ | ------------ | ---------------------- |
| GET  | `/list`            | 获取课时列表 | 通过课程ID获取课时列表 |
| GET  | `/detail`          | 获取课时详情 | 通过课时ID获取详情     |
| POST | `/create`          | 创建课时     | 创建新课时             |
| POST | `/update`          | 更新课时     | 更新课时信息           |
| POST | `/delete`          | 删除课时     | 删除课时               |
| POST | `/upload-video`    | 上传视频     | 上传课时视频到IPFS     |
| POST | `/upload-material` | 上传资料     | 上传课时资料到IPFS     |
| GET  | `/progress`        | 获取学习进度 | 获取用户在该课时的进度 |

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

| 方法 | 路径            | 功能         | 描述                |
| ---- | --------------- | ------------ | ------------------- |
| POST | `/upload`       | 上传文件     | 上传单个文件到IPFS  |
| POST | `/upload/batch` | 批量上传     | 批量上传文件到IPFS  |
| POST | `/upload/json`  | 上传JSON     | 上传JSON数据到IPFS  |
| GET  | `/info`         | 获取文件信息 | 通过CID获取文件信息 |
| GET  | `/url`          | 生成URL      | 生成IPFS访问URL     |
| GET  | `/validate`     | 验证CID      | 验证CID格式         |

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

| 方法 | 路径                 | 功能            | 描述                    |
| ---- | -------------------- | --------------- | ----------------------- |
| GET  | `/user-nfts`         | 获取用户NFT证书 | 通过钱包地址获取NFT证书 |
| GET  | `/nft-detail`        | 获取NFT证书详情 | 通过NFT ID获取详情      |
| POST | `/mint`              | 铸造NFT证书     | 课程完成后铸造NFT证书   |
| GET  | `/verify`            | 验证NFT证书     | 验证NFT证书真实性       |
| POST | `/transfer`          | 转移NFT证书     | 转移NFT证书所有权       |
| GET  | `/blockchain-verify` | 区块链验证      | 通过合约地址验证NFT     |

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

| 方法 | 路径              | 功能         | 描述                     |
| ---- | ----------------- | ------------ | ------------------------ |
| POST | `/create-payment` | 创建支付     | 创建YD币支付订单         |
| POST | `/verify-payment` | 验证支付     | 验证YD币交易             |
| GET  | `/payment-status` | 查询支付状态 | 查询支付状态             |
| POST | `/refund`         | 申请退款     | 申请课程退款             |
| GET  | `/user-payments`  | 获取支付记录 | 通过钱包地址获取支付记录 |
| POST | `/yd-payment`     | YD币支付     | 使用YD币支付课程         |

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

| 方法 | 路径                  | 功能         | 描述                         |
| ---- | --------------------- | ------------ | ---------------------------- |
| GET  | `/user-notifications` | 获取通知列表 | 通过钱包地址获取用户通知     |
| POST | `/mark-read`          | 标记已读     | 标记通知为已读               |
| POST | `/mark-all-read`      | 全部已读     | 标记所有通知为已读           |
| POST | `/delete`             | 删除通知     | 删除通知                     |
| POST | `/send`               | 发送通知     | 发送通知给用户               |
| GET  | `/unread-count`       | 未读数量     | 通过钱包地址获取未读通知数量 |

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

| 方法 | 路径             | 功能         | 描述               |
| ---- | ---------------- | ------------ | ------------------ |
| GET  | `/posts`         | 获取帖子列表 | 获取社区帖子       |
| POST | `/posts`         | 发布帖子     | 发布新帖子         |
| GET  | `/post-detail`   | 获取帖子详情 | 通过帖子ID获取详情 |
| POST | `/update-post`   | 更新帖子     | 更新帖子内容       |
| POST | `/delete-post`   | 删除帖子     | 删除帖子           |
| POST | `/like-post`     | 点赞帖子     | 点赞/取消点赞      |
| POST | `/comment-post`  | 评论帖子     | 评论帖子           |
| GET  | `/post-comments` | 获取评论     | 获取帖子评论       |
| GET  | `/tags`          | 获取标签     | 获取热门标签       |

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

| 方法 | 路径                  | 功能     | 描述             |
| ---- | --------------------- | -------- | ---------------- |
| GET  | `/dashboard`          | 管理面板 | 获取管理面板数据 |
| GET  | `/users`              | 用户管理 | 获取所有用户     |
| POST | `/update-user-status` | 用户状态 | 启用/禁用用户    |
| GET  | `/courses`            | 课程管理 | 获取所有课程     |
| POST | `/approve-course`     | 课程审核 | 审核课程         |
| GET  | `/payments`           | 支付管理 | 获取支付记录     |
| GET  | `/statistics`         | 统计数据 | 获取平台统计数据 |
| POST | `/announcements`      | 发布公告 | 发布平台公告     |

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
