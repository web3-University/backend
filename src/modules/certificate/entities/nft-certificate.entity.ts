import { CommonEntity } from 'src/common/entities/Common.entity';
import { Entity, Column } from 'typeorm';

// nft 要与课程表关联
@Entity()
export class NFTCertificate extends CommonEntity {
  // NFT Token ID
  @Column({ unique: true })
  tokenId: string;

  // NFT合约地址
  @Column()
  contractAddress: string;

  // 拥有者钱包地址
  @Column()
  walletAddress: string;

  // 关联课程ID
  @Column()
  courseId: number;

  // 完成日期
  @Column()
  completionDate: Date;

  // 数据IPFS链接
  @Column()
  metadata: string;

  // 铸造交易哈希
  @Column()
  transactionHash: string;

  // 区块号
  @Column()
  blockNumber: number;

}
