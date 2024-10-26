import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IOrderQueryHandler } from "./order-query-handler.interface";
import { DataSource } from "typeorm";
import { OrderModel } from "./models/order.model";
import { OrderEventModel } from "./models/order-event.model";
import { ShipmentModel } from "./models/shipment.model";
import { OrderItemModel } from "./models/order-item.model";
import { groupBy } from "lodash";

@Injectable()
export class OrderQueryHandler implements IOrderQueryHandler {

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) { }

  async findById(id: string): Promise<any> {
    const order = await this.dataSource.getRepository(OrderModel).findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID ${id} does not exist`);
    const shipments = await this.dataSource.getRepository(ShipmentModel).find({ where: { orderId: id } });
    const orderItems = await this.dataSource.getRepository(OrderItemModel).find({ where: { orderId: id } });
    const shipmentOrderItemsMap = groupBy(orderItems, 'shipmentId');
    return { 
      order, 
      shipments: shipments.map(shipment => ({
        ...shipment,
        itemIds: shipmentOrderItemsMap[shipment.id].map(item => item.id)
      })), 
      orderItems 
    };
  }

  async getOrdersHistory(id: string): Promise<any[]> {
    return this.dataSource
      .getRepository(OrderEventModel)
      .find({ where: { orderId: id } })
      .then(events => events.map(event => event.detail));
  }
}