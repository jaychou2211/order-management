import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { QueryAccessRule } from "./query-access-rule";
import { OrderQuery } from "./order-query-list";
import { IOrderQueryHandler } from "../../database/order-query-handler.interface";

@Injectable()
export class OrderQueryService {
  constructor(
    private readonly queryAccessRule: QueryAccessRule,
    @Inject('ORDER_QUERY_HANDLER')
    private readonly orderQueryHandler: IOrderQueryHandler,
  ) { }

  async canExecute(actionName: OrderQuery, identity: string) {
    const { canExecute } = this.queryAccessRule.canExecute(actionName, identity);
    if (!canExecute) throw '身份不允許';
    return true;
  }

  async getOrder(orderId: string) {
    const order = await this.orderQueryHandler.findById(orderId);
    if (!order) throw new NotFoundException(`Order with ID ${orderId} does not exist`);
    return order;
  }

  async getOrdersHistory(orderId: string) {
    return this.orderQueryHandler.getOrdersHistory(orderId);
  }
}
