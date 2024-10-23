import { Inject, Injectable } from "@nestjs/common";
import { IOrderQueryHandler } from "./order-query-handler.interface";
import { DataSource } from "typeorm";
import { OrderModel } from "./models/order.model";

@Injectable()
export class OrderQueryHandler implements IOrderQueryHandler {

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) { }

  async findById(id: string): Promise<any> {
    return this.dataSource.getRepository(OrderModel).findOne({ where: { id } });
  }
}