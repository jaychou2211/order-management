import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAmazonOrderRepository } from './Database/amazon-order-repository.interface';
import { orderItems, orderList, shipmentDetail_12345, shipments } from './amazon-mock-data';
import { ClientProxy } from '@nestjs/microservices';

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
    console.log('createOrder_in_service');
    const order =
    {
      "id": null,
      "customerId": "ed03fdf5-8ce4-4a66-b76b-8220e5da3b29",
      "address": "123 Main St, Taipei, Taiwan 10001",
      "createdAt": "2023-05-15T10:30:00Z",
      "status": "created",
      "paymentInfo": {
        "cardType": "Visa",
        "last4Digits": "4321"
      },
      "paymentMethod": "credit_card",
      "note": "Please leave the package at the front door",
      "shipments": [
        {
          "id": null,
          "status": "pending",
          "paymentStatus": "pending",
          "orderItems": [
            {
              "id": null,
              "productId": "PROD-001",
              "quantity": 2,
              "totalPrice": 1000
            },
            {
              "id": null,
              "productId": "PROD-002",
              "quantity": 1,
              "totalPrice": 500
            }
          ]
        },
        {
          "id": null,
          "status": "pending",
          "paymentStatus": "pending",
          "orderItems": [
            {
              "id": null,
              "productId": "PROD-003",
              "quantity": 3,
              "totalPrice": 1500
            }
          ]
        }
      ]
    }
    this.ordersClient.emit('order.create', {
      ...order,
      Authorization: 'Bearer SYSTEM'
    });
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
