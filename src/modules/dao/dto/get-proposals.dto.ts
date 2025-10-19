import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsEthereumAddress,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 获取提案列表查询 DTO
 */
export class GetProposalsDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: '课程ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  courseId?: number;

  @ApiProperty({
    description: '提案状态',
    example: 'Active',
    enum: ['Active', 'Succeeded', 'Failed', 'Canceled', 'Executed'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Succeeded', 'Failed', 'Canceled', 'Executed'])
  status?: string;

  @ApiProperty({
    description: '提案人钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEthereumAddress()
  proposerWallet?: string;

  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'votingEndTime', 'forVotes', 'againstVotes'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'votingEndTime', 'forVotes', 'againstVotes'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
