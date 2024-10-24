import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AmazonOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  AmazonOrderId: string;

  @Column('json')
  detail: Object;
}