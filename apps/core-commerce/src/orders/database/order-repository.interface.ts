import type { Order } from "../domain/order";

export interface IOrderRepository {
  findById(id: string): Promise<Order>;
  save(order: Order, domainEvents: any[]): Promise<void>;
}
