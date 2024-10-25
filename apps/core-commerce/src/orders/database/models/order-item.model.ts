import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_items')
export class OrderItemModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid', nullable: true })
  shipmentId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  // 可以根據需要添加創建時間和更新時間
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

