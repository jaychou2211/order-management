import { Injectable, Scope } from "@nestjs/common";
import { OrderStateMachine } from "./order-state-machine";
import { Order } from "../../domain/order";
import { OrderCommand } from "./order-command-list";
import { IOrderRepository } from "../../database/order-repository.interface";

@Injectable({ scope: Scope.REQUEST })
export class OrderCommandService {
  private orderRepository: IOrderRepository;
  private identity: string;

  constructor(
    private readonly orderStateMachine: OrderStateMachine
  ) { }

  setOrderRepository(orderRepository: IOrderRepository) {
    this.orderRepository = orderRepository;
  }

  setIdentity(identity: string) {
    this.identity = identity;
  }

  public async canExecute(
    orderId: string,
    actionName: OrderCommand,
  ) {
    if (!this.orderRepository) throw 'orderRepository 未被注入';
    // 檢查有沒有其他使用者正在修改訂單 by distributed lock 
    const order = (actionName === 'create')
      ? { status: null }
      : await this.orderRepository.findById(orderId);

    // 檢查可不可以執行
    const { canExecute, initState } = this.orderStateMachine
      .canExecute(actionName, order.status, this.identity);
    if (!canExecute) throw '身份不允許 or 目前訂單狀態不允許執行該動作';
    if (initState !== order.status) throw '狀態不吻合';
    return true;
  }

  private async safeChangeState(
    orderId: string,
    actionName: OrderCommand,
    operation: (args: any) => any
  ) {
    if (!this.orderRepository) throw 'orderRepository 未被注入';
    // 檢查有沒有其他使用者正在修改訂單 by distributed lock 
    // 有的話拋錯, 這裡先假設沒有 (beyond the scope of our current implementation)
    const order = await this.orderRepository.findById(orderId);
    // 查到後上鎖(因為要改 order 的狀態了)

    // 檢查可不可以執行
    const { canExecute, initState, finalStates } = this.orderStateMachine
      .canExecute(actionName, order.status, this.identity);
    if (!canExecute) throw '身份不允許 or 目前訂單狀態不允許執行該動作';
    if (initState !== order.status) throw '狀態不吻合';

    // 執行
    const domainEvents = await operation(order);
    if (finalStates[0] !== null && !finalStates.includes(order.status)) throw '狀態不吻合';

    // 更新訂單
    await this.orderRepository.save(order, domainEvents);

    // 推送事件
    domainEvents.forEach(domainEvent => {
      // this.eventBus.publish(domainEvent);
      console.log('event_bus emit the new domainevent:');
      console.dir(domainEvent, { depth: Infinity });
    });

    // release distributed lock
    return true;
  }

  public async create(createOrderProps: Parameters<typeof Order.create>[0]) {
    const result = this.orderStateMachine
      .canExecute(OrderCommand.CREATE, null, this.identity);
    if (!result.canExecute) throw '身份不允許或是目前狀態不允許執行該動作';

    // 照理來講這裡要先跟 ProductService 確認商品的資訊
    // ex: 商品是否存在, 庫存是否足夠, 總價是否正確
    // 這裡先假設商品資訊都正確 (beyond the scope of our current implementation)

    // 建立訂單
    const { order, domainEvents } = Order.create(createOrderProps);
    if (!result.finalStates.includes(order.status)) throw '結束狀態不吻合';
    await this.orderRepository.save(order, domainEvents);

    // 推送事件
    domainEvents.forEach(domainEvent => {
      // this.eventBus.publish(domainEvent);
      console.log('event_bus emit the new domainevent:');
      console.dir(domainEvent, { depth: Infinity });
    });
    return true;
  };

  public async check(
    orderId: string,
    createShipmentDtoList: Parameters<typeof Order.prototype.check>[0]
  ) {
    return this.safeChangeState(orderId, OrderCommand.CHECK, (order => order.check(createShipmentDtoList)));
  }

  public async ship(orderId: string, shipmentId: string) {
    return this.safeChangeState(orderId, OrderCommand.SHIP, (order => order.ship(shipmentId)));
  }

  public async deliver(orderId: string, shipmentId: string) {
    return this.safeChangeState(orderId, OrderCommand.DELIVER, (order => order.deliver(shipmentId)));
  }

  public async complete(orderId: string) {
    return this.safeChangeState(orderId, OrderCommand.COMPLETE, (order => order.complete()));
  }

  public async cancel(orderId: string) {
    return this.safeChangeState(orderId, OrderCommand.CANCEL, (order => order.cancel()));
  }

  public async pay(orderId: string, shipmentId: string, success: boolean) {
    return this.safeChangeState(orderId, OrderCommand.PAY, (order => order.pay(shipmentId, success)));
  }
}
