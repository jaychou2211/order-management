
import { OrderModel } from './models/order.model';
import { Order } from '../domain/order';
import { OrderItemModel } from './models/order-item.model';
import { ShipmentModel } from './models/shipment.model';
import { pick } from 'lodash';
import { Shipment } from '../domain/shipment';

export class OrderMapper {
  public static toDomain(
    orderData: OrderModel,
    shipmentDataList: ShipmentModel[],
    orderItemDataList: OrderItemModel[],
  ): Order {
    const orderItems = orderItemDataList
      .map(item => pick(item, ['id', 'productId', 'quantity', 'totalPrice', 'note']))
    const shipments = shipmentDataList
      .map(shipment => pick(shipment, ['id', 'status', 'paymentStatus']))
      .map(shipment => new Shipment({
        ...shipment,
        orderItems: orderItems.filter(item => item.shipmentId === shipment.id)
      }))
    const { order } = Order.create({
      ...orderData,
      shipments,
      orderItems
    });
    return order;
  }

  public static toModel(order: Order): {
    orderData: OrderModel;
    shipmentDataList: Omit<ShipmentModel, 'createdAt'>[];
    orderItemDataList: Omit<OrderItemModel, 'createdAt'>[];
  } {
    const { shipments, orderItems, ...orderData } = order;
    return {
      orderData,
      shipmentDataList: shipments.map(shipment => ({
        ...shipment,
        orderId: order.id
      })),
      orderItemDataList: orderItems
        .map(orderItem => ({
          ...orderItem,
          orderId: order.id,
          shipmentId: shipments.find(shipment =>
            shipment.orderItems.some(item => item.id === orderItem.id))?.id
        }))
    };
  }
}
