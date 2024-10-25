import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { OrderChannel, OrderStatus } from '../../domain/order';

@Entity('orders')
export class OrderModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerEmail: string;

  @Column('jsonb')
  address: object;

  @Column({
    type: 'enum',
    enum: OrderChannel,
    default: OrderChannel.DOG_CAT
  })
  channel: OrderChannel;

  @Column({ nullable: true })
  channelOrderId: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED
  })
  status: OrderStatus;

  @Column('jsonb', { nullable: true })
  paymentInfo: any;

  @Column()
  paymentMethod: string;

  @Column('jsonb', { nullable: true })
  note: object;
}

