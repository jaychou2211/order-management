import { AmazonOrder } from "./amazon-order.model";

export enum AmazonOrderEvent {
  CREATE = 'create',
  UPDATE = 'update',
}

// 這裡的情境很單純
// 沒有守護幾個領域物件的連動修改後的一致性
// 所以先偷懶，讓這裡的 repository 不只負責改狀態也會進行純粹的查詢
// 就不把 command 和 query 切開了
export interface IAmazonOrderRepository {
  /**
   * 取得訂單資料
   */
  getLastestTwoOrdersSnapshot(AmazonOrderId: string): Promise<AmazonOrder[]>;

  /** 
   * 存入資料庫
   */
  save<T extends { AmazonOrderId: string }>(amazonOrder: T): Promise<{
    event: AmazonOrderEvent,
    AmazonOrderId: string,
  }>;
}
