# DAO 模块 - 课程质量投票系统

## 概述

DAO 模块实现了基于代币投票的课程质量治理系统，允许社区参与课程质量监管。

## 功能特性

- ✅ 创建课程质量投票提案
- ✅ 代币权重投票机制
- ✅ 自动奖励分配
- ✅ 提案状态管理
- ✅ 法定人数验证
- ✅ 防作恶机制

## API 接口

### 1. 创建提案

```http
POST /api/dao/proposals
Content-Type: application/json

{
  "courseId": 1,
  "reason": "课程内容过时，讲师不回复学生问题",
  "proposerWallet": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "proposalDeposit": "1000"
}
```

### 2. 投票

```http
POST /api/dao/proposals/1/vote
Content-Type: application/json

{
  "option": 1,
  "voterWallet": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "votingPower": "1000"
}
```

### 3. 结束投票

```http
POST /api/dao/proposals/1/finalize
```

### 4. 执行提案

```http
POST /api/dao/proposals/1/execute
```

### 5. 领取奖励

```http
POST /api/dao/proposals/1/claim-reward
Content-Type: application/json

{
  "voterWallet": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

### 6. 获取提案列表

```http
GET /api/dao/proposals?page=1&limit=10&status=Active
```

### 7. 获取提案详情

```http
GET /api/dao/proposals/1
```

### 8. 获取 DAO 统计

```http
GET /api/dao/stats
```

## 数据库表结构

### dao_proposals (提案表)

- proposalId: 提案ID
- courseId: 课程ID
- proposerWallet: 提案人钱包地址
- reason: 发起原因
- proposalDeposit: 提案押金
- votingStartTime: 投票开始时间
- votingEndTime: 投票结束时间
- forVotes: 支持票数
- againstVotes: 反对票数
- totalVotingPower: 总投票权重
- status: 提案状态
- executed: 是否已执行

### dao_votes (投票表)

- id: 投票记录ID
- proposalId: 提案ID
- voterWallet: 投票人钱包地址
- option: 投票选项 (0: For, 1: Against)
- votingPower: 投票权重
- rewardClaimed: 是否已领取奖励

### dao_config (配置表)

- proposalDeposit: 提案押金
- minVotingPower: 最小投票权重
- votingPeriod: 投票期限
- quorumPercentage: 法定人数百分比
- passThreshold: 通过阈值
- rewardPoolPercentage: 奖励池百分比

## 业务流程

1. **创建提案**: 用户支付押金创建课程质量投票提案
2. **社区投票**: 用户锁定代币参与投票
3. **结束投票**: 投票期结束后自动计算结果
4. **执行提案**: 提案通过后执行治理操作
5. **领取奖励**: 投票者根据结果领取奖励

## 经济模型

- **提案押金**: 1000 YD (防止垃圾提案)
- **最小投票权重**: 100 YD (防止刷票)
- **投票期限**: 7天 (充分讨论时间)
- **法定人数**: 10% (确保代表性)
- **通过阈值**: 50% (反对票需过半)
- **奖励池比例**: 80% (激励正确投票)

## 安全机制

- 重入攻击防护
- 权限验证
- 时间限制
- 代币余额检查
- 状态一致性验证

## 使用示例

```typescript
// 创建提案
const proposal = await daoService.createProposal({
  courseId: 1,
  reason: '课程质量差',
  proposerWallet: '0x...',
  proposalDeposit: '1000',
});

// 投票
const vote = await daoService.vote(proposal.proposalId, {
  option: 1, // Against
  voterWallet: '0x...',
  votingPower: '1000',
});

// 结束投票
await daoService.finalizeProposal(proposal.proposalId);

// 领取奖励
const reward = await daoService.claimReward(proposal.proposalId, {
  voterWallet: '0x...',
});
```
