import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAmazonOrderRepository } from './database/amazon-order-repository.interface';
import { orderItems, orderList, shipmentDetail_12345, shipments } from './amazon-mock-data';

@Injectable()
export class AmazonOrderService {

  constructor(
    @Inject("AMAZON_ORDER_REPOSITORY")
    private readonly amazonOrderRepository: IAmazonOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * 假設透過 Amazon SP API 
   * GET /orders/v0/orders
   * 取得 10 分鐘內的所有訂單
   */
  async fetchOrders() {
    // after fetching
    const fetchedOrders = orderList;

    await fetchedOrders.reduce(async (lastProessing, order) => {
      try {
        // 等前一個與資料庫的互動完成
        await lastProessing;
        // 先存入資料庫
        const { event, AmazonOrderId } = await this.amazonOrderRepository.save(order);
        // 用 event-emitter 模擬發送 message 到 message queue
        // 反正也只有當前所在的 microservice 在意這類的 event
        // 這一步甭 await
        this.eventEmitter.emit(`amazon-order.${event}`, { AmazonOrderId });
      } catch (error) {
        console.error(error);
      }
    }, Promise.resolve(undefined));
  }

  async createOrder(AmazonOrderId: string) {
    // 捏資料
    // 通知 core-commerce 創建訂單
    throw new Error('Not implemented');
  }

  async updateOrder(AmazonOrderId: string) {

    // 通知 core-commerce 更新訂單
    throw new Error('Not implemented');
  }

  private async getOrderItems(AmazonOrderId: string) {
    return { ...orderItems };
  };

  private async getOrderShipments(AmazonOrderId: string) {
    const orderShipments = { ...shipments };
    const detailShipments = { ...shipmentDetail_12345 };
  };
}
