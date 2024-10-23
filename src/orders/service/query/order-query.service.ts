import { Injectable } from "@nestjs/common";
import { QueryAccessRule } from "./query-access-rule";
import { OrderQuery } from "./order-query-list";
import { OrderQueryHandler } from "src/orders/database/order-query-handler";

@Injectable()
export class OrderQueryService {
  constructor(
    private readonly queryAccessRule: QueryAccessRule,
    private readonly orderQueryHandler: OrderQueryHandler,
  ) { }

  async canExecute(actionName: OrderQuery, identity: string) {
    const { canExecute } = this.queryAccessRule.canExecute(actionName, identity);
    if (!canExecute) throw '身份不允許';
    return true;
  }

  async getOrder(orderId: string) {
    return this.orderQueryHandler.findById(orderId);
  }
}
