import { Transaction } from '@app/common';
import { IOrderRepository } from './order-repository.interface';
import { OrderModel } from './models/order.model';
import { ShipmentModel } from './models/shipment.model';
import { OrderItemModel } from './models/order-item.model';
import { OrderMapper } from './order-mapper';
import { Order } from '../domain/order';
import { OrderEventModel } from './models/order-event.model';

export class OrderRepository implements IOrderRepository {
  constructor(
    private readonly transaction: Transaction,
  ) { }

  async findById(id: string): Promise<Order> {
    const trxConnection = this.transaction.getTrxConnection();
    const orderData = await trxConnection.manager.getRepository(OrderModel).findOne({ where: { id } });
    const shipmentDataList = await trxConnection.manager.getRepository(ShipmentModel).find({ where: { orderId: id } });
    const orderItemDataList = await trxConnection.manager.getRepository(OrderItemModel).find({ where: { orderId: id } });
    return OrderMapper.toDomain(orderData, shipmentDataList, orderItemDataList);
  };

  async save(order: Order, domainEvents: OrderEventModel[]): Promise<void> {
    const trxConnection = this.transaction.getTrxConnection();
    const orderModel = OrderMapper.toModel(order);
    try {
      await trxConnection.manager.getRepository(OrderModel).save(orderModel.orderData);
      await trxConnection.manager.getRepository(ShipmentModel).save(orderModel.shipmentDataList);
      await trxConnection.manager.getRepository(OrderItemModel).save(orderModel.orderItemDataList);
      await trxConnection.manager.getRepository(OrderEventModel).save(
        domainEvents.map(event => ({ detail: event, orderId: order.id }))
      );
      await this.transaction.commit();
    } catch (error) {
      await this.transaction.rollback();
      throw error;
    } finally {
      await this.transaction.release();
    }
  };
}
