// Swagger 文档常量定义
// 这些常量可以在控制器中使用 @ApiOperation 等装饰器时引用

/**
 * DAO 模块 Swagger 文档
 * 提供课程质量投票相关的 API 文档
 */

// 创建提案文档
export const CreateProposalDoc = {
  summary: '创建课程质量投票提案',
  description: '用户可以为课程创建质量投票提案，需要支付提案押金',
  operationId: 'createProposal',
  tags: ['DAO - 课程质量投票'],
  requestBody: {
    description: '提案信息',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['courseId', 'reason', 'proposerWallet', 'proposalDeposit'],
          properties: {
            courseId: {
              type: 'number',
              description: '课程ID',
              example: 1,
            },
            reason: {
              type: 'string',
              description: '发起原因/描述',
              example: '课程内容过时，讲师不回复学生问题',
              minLength: 10,
              maxLength: 500,
            },
            proposerWallet: {
              type: 'string',
              description: '提案人钱包地址',
              example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            },
            proposalDeposit: {
              type: 'string',
              description: '提案押金（YD币数量）',
              example: '1000',
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: '提案创建成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposalId: { type: 'number', example: 1 },
              courseId: { type: 'number', example: 1 },
              proposerWallet: {
                type: 'string',
                example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
              },
              reason: {
                type: 'string',
                example: '课程内容过时，讲师不回复学生问题',
              },
              proposalDeposit: { type: 'string', example: '1000' },
              votingStartTime: { type: 'string', format: 'date-time' },
              votingEndTime: { type: 'string', format: 'date-time' },
              status: { type: 'string', example: 'Active' },
            },
          },
        },
      },
    },
    400: {
      description: '请求参数错误',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '提案押金不能少于 1000 YD' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '课程不存在',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: '课程 1 不存在' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
    409: {
      description: '课程已有活跃提案',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 409 },
              message: { type: 'string', example: '课程 1 已有活跃提案' },
              error: { type: 'string', example: 'Conflict' },
            },
          },
        },
      },
    },
  },
};

// 投票文档
export const VoteDoc = {
  summary: '对提案进行投票',
  description: '用户可以对活跃的提案进行投票，需要锁定代币',
  operationId: 'vote',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: '提案ID',
      required: true,
      schema: { type: 'number', example: 1 },
    },
  ],
  requestBody: {
    description: '投票信息',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['option', 'voterWallet', 'votingPower'],
          properties: {
            option: {
              type: 'number',
              description: '投票选项 (0: For支持课程, 1: Against反对课程)',
              example: 1,
              enum: [0, 1],
            },
            voterWallet: {
              type: 'string',
              description: '投票人钱包地址',
              example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            },
            votingPower: {
              type: 'string',
              description: '投票权重（锁定的YD币数量）',
              example: '1000',
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: '投票成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              proposalId: { type: 'number', example: 1 },
              voterWallet: {
                type: 'string',
                example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
              },
              option: { type: 'number', example: 1 },
              votingPower: { type: 'string', example: '1000' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    400: {
      description: '请求参数错误或投票时间已过',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '当前不在投票时间内' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '提案不存在',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: '提案 1 不存在' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
    409: {
      description: '已经投过票了',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 409 },
              message: { type: 'string', example: '您已经投过票了' },
              error: { type: 'string', example: 'Conflict' },
            },
          },
        },
      },
    },
  },
};

// 获取提案列表文档
export const GetProposalsDoc = {
  summary: '获取提案列表',
  description: '分页获取提案列表，支持多种筛选和排序条件',
  operationId: 'getProposals',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'page',
      in: 'query',
      description: '页码',
      required: false,
      schema: { type: 'number', example: 1, minimum: 1 },
    },
    {
      name: 'limit',
      in: 'query',
      description: '每页数量',
      required: false,
      schema: { type: 'number', example: 10, minimum: 1, maximum: 100 },
    },
    {
      name: 'courseId',
      in: 'query',
      description: '课程ID',
      required: false,
      schema: { type: 'number', example: 1 },
    },
    {
      name: 'status',
      in: 'query',
      description: '提案状态',
      required: false,
      schema: {
        type: 'string',
        enum: ['Active', 'Succeeded', 'Failed', 'Canceled', 'Executed'],
        example: 'Active',
      },
    },
    {
      name: 'proposerWallet',
      in: 'query',
      description: '提案人钱包地址',
      required: false,
      schema: {
        type: 'string',
        example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      },
    },
    {
      name: 'sortBy',
      in: 'query',
      description: '排序字段',
      required: false,
      schema: {
        type: 'string',
        enum: ['createdAt', 'votingEndTime', 'forVotes', 'againstVotes'],
        example: 'createdAt',
      },
    },
    {
      name: 'sortOrder',
      in: 'query',
      description: '排序方向',
      required: false,
      schema: {
        type: 'string',
        enum: ['ASC', 'DESC'],
        example: 'DESC',
      },
    },
  ],
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    proposalId: { type: 'number', example: 1 },
                    courseId: { type: 'number', example: 1 },
                    proposerWallet: {
                      type: 'string',
                      example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                    },
                    reason: {
                      type: 'string',
                      example: '课程内容过时，讲师不回复学生问题',
                    },
                    proposalDeposit: { type: 'string', example: '1000' },
                    votingStartTime: { type: 'string', format: 'date-time' },
                    votingEndTime: { type: 'string', format: 'date-time' },
                    forVotes: { type: 'string', example: '2500' },
                    againstVotes: { type: 'string', example: '5000' },
                    totalVotingPower: { type: 'string', example: '7500' },
                    status: { type: 'string', example: 'Active' },
                    executed: { type: 'boolean', example: false },
                    course: {
                      type: 'object',
                      properties: {
                        courseId: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'Web3 开发入门' },
                        instructorWallet: {
                          type: 'string',
                          example: '0x1234567890123456789012345678901234567890',
                        },
                      },
                    },
                    votes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 1 },
                          voterWallet: {
                            type: 'string',
                            example:
                              '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                          },
                          option: { type: 'number', example: 1 },
                          votingPower: { type: 'string', example: '1000' },
                          rewardClaimed: { type: 'boolean', example: false },
                        },
                      },
                    },
                  },
                },
              },
              total: { type: 'number', example: 25 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 3 },
            },
          },
        },
      },
    },
  },
};

// 获取 DAO 统计信息文档
export const GetDAOStatsDoc = {
  summary: '获取 DAO 统计信息',
  description: '获取 DAO 系统的整体统计信息',
  operationId: 'getDAOStats',
  tags: ['DAO - 课程质量投票'],
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              totalProposals: {
                type: 'number',
                example: 25,
                description: '总提案数',
              },
              activeProposals: {
                type: 'number',
                example: 3,
                description: '活跃提案数',
              },
              succeededProposals: {
                type: 'number',
                example: 8,
                description: '通过的提案数',
              },
              failedProposals: {
                type: 'number',
                example: 12,
                description: '失败的提案数',
              },
              totalVoters: {
                type: 'number',
                example: 150,
                description: '总投票人数',
              },
            },
          },
        },
      },
    },
  },
};

// 结束投票文档
export const FinalizeProposalDoc = {
  summary: '结束提案投票',
  description: '投票期结束后，计算投票结果并更新提案状态',
  operationId: 'finalizeProposal',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: '提案ID',
      required: true,
      schema: { type: 'number', example: 1 },
    },
  ],
  responses: {
    200: {
      description: '投票结束成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposalId: { type: 'number', example: 1 },
              status: { type: 'string', example: 'Succeeded' },
              forVotes: { type: 'string', example: '2500' },
              againstVotes: { type: 'string', example: '5000' },
              totalVotingPower: { type: 'string', example: '7500' },
              hasReachedQuorum: { type: 'boolean', example: true },
              isPassed: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
    400: {
      description: '提案状态错误或投票时间未到',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '投票尚未结束' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '提案不存在',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: '提案 1 不存在' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
  },
};

// 执行提案文档
export const ExecuteProposalDoc = {
  summary: '执行提案',
  description: '执行已通过的提案，对课程进行治理操作',
  operationId: 'executeProposal',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: '提案ID',
      required: true,
      schema: { type: 'number', example: 1 },
    },
  ],
  responses: {
    200: {
      description: '提案执行成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposalId: { type: 'number', example: 1 },
              status: { type: 'string', example: 'Executed' },
              executed: { type: 'boolean', example: true },
              executedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    400: {
      description: '提案无法执行',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '提案尚未通过或已执行' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '提案不存在',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: '提案 1 不存在' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
  },
};

// 领取奖励文档
export const ClaimRewardDoc = {
  summary: '领取投票奖励',
  description: '根据投票结果领取相应的奖励',
  operationId: 'claimReward',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: '提案ID',
      required: true,
      schema: { type: 'number', example: 1 },
    },
  ],
  requestBody: {
    description: '投票人信息',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['voterWallet'],
          properties: {
            voterWallet: {
              type: 'string',
              description: '投票人钱包地址',
              example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: '奖励领取成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              reward: {
                type: 'string',
                example: '1500',
                description: '可领取的奖励金额（YD币）',
              },
            },
          },
        },
      },
    },
    400: {
      description: '无法领取奖励',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '您已经领取过奖励了' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '提案不存在或未参与投票',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: '您没有参与此提案的投票' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
  },
};

// 取消提案文档
export const CancelProposalDoc = {
  summary: '取消提案',
  description: '提案发起人在特定条件下可以取消提案',
  operationId: 'cancelProposal',
  tags: ['DAO - 课程质量投票'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: '提案ID',
      required: true,
      schema: { type: 'number', example: 1 },
    },
  ],
  requestBody: {
    description: '提案人信息',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['proposerWallet'],
          properties: {
            proposerWallet: {
              type: 'string',
              description: '提案人钱包地址',
              example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: '提案取消成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposalId: { type: 'number', example: 1 },
              status: { type: 'string', example: 'Canceled' },
              proposerWallet: {
                type: 'string',
                example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
              },
            },
          },
        },
      },
    },
    400: {
      description: '无法取消提案',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: '已超过取消时间限制' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    },
    404: {
      description: '提案不存在或您不是提案人',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: {
                type: 'string',
                example: '提案 1 不存在或您不是提案人',
              },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    },
  },
};

// 获取 DAO 配置文档
export const GetDAOConfigDoc = {
  summary: '获取 DAO 配置',
  description: '获取 DAO 系统的配置参数',
  operationId: 'getDAOConfig',
  tags: ['DAO - 课程质量投票'],
  responses: {
    200: {
      description: '获取成功',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              proposalDeposit: {
                type: 'string',
                example: '1000',
                description: '提案押金（YD币）',
              },
              minVotingPower: {
                type: 'string',
                example: '100',
                description: '最小投票权重（YD币）',
              },
              votingPeriod: {
                type: 'number',
                example: 604800,
                description: '投票期限（秒）',
              },
              quorumPercentage: {
                type: 'number',
                example: 1000,
                description: '法定人数百分比（基点）',
              },
              passThreshold: {
                type: 'number',
                example: 5000,
                description: '通过阈值（基点）',
              },
              rewardPoolPercentage: {
                type: 'number',
                example: 8000,
                description: '奖励池百分比（基点）',
              },
              cancelTimeLimit: {
                type: 'number',
                example: 86400,
                description: '取消时间限制（秒）',
              },
              isEnabled: {
                type: 'boolean',
                example: true,
                description: '是否启用DAO功能',
              },
            },
          },
        },
      },
    },
  },
};
