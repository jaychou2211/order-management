import { Controller, Post } from '@nestjs/common';
import { AmazonOrderService } from './amazon-orders.service';
import { OnEvent } from '@nestjs/event-emitter';

@Controller('amazon-orders')
export class AmazonOrderController {
  constructor(private readonly amazonOrderService: AmazonOrderService) { }

  /**
   * 假設 :
   * 1. 會根據當前時間點往前取 10 分鐘內的所有訂單資訊
   * 2. 此 endpoint 每10分鐘會被 call 一次
   */
  @Post()
  async fetchOrders() {
    return this.amazonOrderService.fetchOrders();
  };

  /**
   * 模擬收到 message queue 的 [amazon-order.created] event
   */
  @OnEvent('amazon-order.created')
  async createOrder(payload: { AmazonOrderId: string }) {
    return this.amazonOrderService.createOrder(payload.AmazonOrderId);
  }

  @Post('create-order')
  async createOrderHttp() {
    console.log('createOrderHttp');
    return this.amazonOrderService.createOrder('123456');
  }


  /**
   * 模擬收到 message queue 的 [amazon-order.update] event
   */
  @OnEvent('amazon-order.update')
  async updateOrder(payload: { AmazonOrderId: string }) {
    return this.amazonOrderService.updateOrder(payload.AmazonOrderId);
  }
}
