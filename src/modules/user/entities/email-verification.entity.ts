import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from 'src/common/entities/Common.entity';

@Entity()
@Index(['walletAddress', 'email'])
export class EmailVerification extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletAddress: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
}
