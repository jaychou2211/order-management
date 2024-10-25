import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_events')
export class OrderEventModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  orderId: string;

  @Column('jsonb')
  detail: object;
}
