import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { OrderStatus } from '../../domain/order';

@Entity('orders')
export class OrderModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column()
  address: string;

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

  @Column({ nullable: true })
  note: string;
}

