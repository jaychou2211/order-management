
import { OrderModel } from './models/order.model';
import { Order } from '../domain/order';
import { OrderItemModel } from './models/order-item.model';
import { ShipmentModel } from './models/shipment.model';
import { pick } from 'lodash';

export class OrderMapper {
  public static toDomain(
    orderData: OrderModel,
    shipmentDataList: ShipmentModel[],
    orderItemDataList: OrderItemModel[],
  ): Order {
    const orderItems = orderItemDataList
      .map(item => pick(item, ['shipmentId', 'id', 'productId', 'quantity', 'totalPrice']))
    const shipments = shipmentDataList
      .map(shipment => pick(shipment, ['id', 'status', 'paymentStatus']))
      .map(shipment => ({
        ...shipment,
        orderItems: orderItems.filter(item => item.shipmentId === shipment.id)
      }))
    const { order } = Order.create({
      ...orderData,
      shipments
    });
    return order;
  }

  public static toModel(order: Order): {
    orderData: Omit<OrderModel, 'createdAt'>;
    shipmentDataList: Omit<ShipmentModel, 'createdAt'>[];
    orderItemDataList: Omit<OrderItemModel, 'createdAt'>[];
  } {
    const { shipments, ...orderData } = order;
    return {
      orderData,
      shipmentDataList: shipments.map(shipment => ({
        ...shipment,
        orderId: order.id
      })),
      orderItemDataList: order.shipments
        .map(shipment => shipment.orderItems.map(item => ({
          ...item,
          orderId: order.id,
          shipmentId: shipment.id
        })))
        .flat(2)
    };
  }
}
