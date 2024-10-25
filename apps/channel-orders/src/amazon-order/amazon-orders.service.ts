import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAmazonOrderRepository } from './Database/amazon-order-repository.interface';
import { orderItems, orderList, order } from './amazon-mock-data';
import { ClientProxy } from '@nestjs/microservices';
import { OrderChannel, OrderStatus } from '@app/common';

@Injectable()
export class AmazonOrderService {

  constructor(
    @Inject("AMAZON_ORDER_REPOSITORY")
    private readonly amazonOrderRepository: IAmazonOrderRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject('ORDERS_CLIENT')
    private readonly ordersClient: ClientProxy,
  ) { }

  /**
   * 假設透過 Amazon SP API 
   * GET /orders/v0/orders
   * 使用 LastUpdatedAfter/LastUpdatedBefore 而不是 CreatedAfter/CreatedBefore 來追蹤訂單狀態變化
   * 取得時間段內的所有變化過的訂單們
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
    const order = await this.getOrder(AmazonOrderId);
    this.ordersClient.emit('order.create', {
      ...order,
      Authorization: 'Bearer SYSTEM'
    });
  }

  async updateOrder(AmazonOrderId: string) {
    // 捏資料後, 通知 core-commerce 更新訂單
    // this.ordersClient.emit('order.update', {
    //   ...order,
    //   Authorization: 'Bearer SYSTEM'
    // });
    throw new Error('Not implemented');
  }

  private async getOrder(AmazonOrderId: string) {
    // 假設 get by AmazonOrderId
    // GET /orders/v0/orders/{orderId}
    return {
      id: null,
      customerEmail: order.BuyerInfo.BuyerEmail,
      address: order.DefaultShipFromLocationAddress,
      channel: OrderChannel.AMAZON,
      channelOrderId: AmazonOrderId,
      createdAt: order.PurchaseDate,
      status: OrderStatus.CREATED,
      paymentInfo: {
        PaymentMethodDetails: order.PaymentMethodDetails
      },
      paymentMethod: order.PaymentMethod,
      note: null,
      orderItems: await this.getOrderItems(AmazonOrderId),
    };
  }

  private async getOrderItems(AmazonOrderId: string) {
    // GET /orders/v0/orders/{orderId}/orderItems
    // 捏成 core-commerce 的 order 體系在意的形狀 😳
    return orderItems.map(orderItem => ({
      id: orderItem.OrderItemId,
      productId: orderItem.ASIN,
      quantity: orderItem.ProductInfo.NumberOfItems,
      totalPrice: parseFloat(orderItem.ItemPrice.Amount) * orderItem.ProductInfo.NumberOfItems,
      note: {
        // Amazon平台的訂單有配送日期, 而咱們團隊在意這資訊
        ScheduledDeliveryStartDate: orderItem.ScheduledDeliveryStartDate,
        ScheduledDeliveryEndDate: orderItem.ScheduledDeliveryEndDate,
      }
    }));
  };
}
