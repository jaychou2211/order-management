import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AmazonOrderEvent, IAmazonOrderRepository } from "./amazon-order-repository.interface";
import { AmazonOrder } from "./amazon-order.model";

@Injectable()
export class AmazonOrderRepository implements IAmazonOrderRepository {

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource
  ) { }

  async getLastestTwoOrdersSnapshot(AmazonOrderId: string): Promise<AmazonOrder[]> {
    return this.dataSource.getRepository(AmazonOrder)
      .find({ where: { AmazonOrderId } })
      // 假設預設是以修改時間 ASC 排序，取最後 2 筆
      .then((orders) => orders.slice(-2));
  }

  async save<T extends { AmazonOrderId: string }>(amazonOrder: T) {
    // 是否已存在
    const existed = await this.dataSource.getRepository(AmazonOrder)
      .findOneBy({ AmazonOrderId: amazonOrder.AmazonOrderId });

    // 寫入資料庫(想保留任意時刻的狀態)
    await this.dataSource.getRepository(AmazonOrder).save(amazonOrder);

    // 回傳事件
    return {
      event: existed ? AmazonOrderEvent.UPDATE : AmazonOrderEvent.CREATE,
      AmazonOrderId: amazonOrder.AmazonOrderId,
    }
  }
}
