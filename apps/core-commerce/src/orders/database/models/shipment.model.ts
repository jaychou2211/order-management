import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ShipmentStatus, PaymentStatus } from '../../domain/shipment';

@Entity('shipments')
export class ShipmentModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING
  })
  status: ShipmentStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  // 可以根據需要添加創建時間和更新時間
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

