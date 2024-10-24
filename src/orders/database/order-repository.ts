import { Transaction } from 'src/shared/database/transaction.interface';
import { IOrderRepository } from './order-repository.interface';
import { OrderModel } from './models/order.model';
import { ShipmentModel } from './models/shipment.model';
import { OrderItemModel } from './models/order-item.model';
import { OrderMapper } from './order-mapper';
import { Order } from '../domain/order';

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

  async save(order: Order): Promise<void> {
    const trxConnection = this.transaction.getTrxConnection();
    const orderModel = OrderMapper.toModel(order);
    try {
      await trxConnection.manager.getRepository(OrderModel).save(orderModel.orderData);
      await trxConnection.manager.getRepository(ShipmentModel).save(orderModel.shipmentDataList);
      await trxConnection.manager.getRepository(OrderItemModel).save(orderModel.orderItemDataList);
      await this.transaction.commit();
    } catch (error) {
      await this.transaction.rollback();
      throw error;
    } finally {
      await this.transaction.release();
    }
  };
}
