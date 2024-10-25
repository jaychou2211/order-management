import { OrderItem } from "./order-item";
import { Shipment, ShipmentStatus } from "./shipment";

export enum OrderChannel {
  DOG_CAT = 'dog_cat',
  AMAZON = 'amazon',
  MOMO = 'momo'
}

export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

type OrderProps = Pick<Order,
  'id' |
  'customerEmail' |
  'address' |
  'channel' |
  'channelOrderId' |
  'createdAt' |
  'status' |
  'paymentInfo' |
  'paymentMethod' |
  'note' |
  'shipments' |
  'orderItems'
>;

export class Order {
  id: string;
  customerEmail: string;
  address: object; // 送貨地址
  channel: OrderChannel; // 銷售渠道
  channelOrderId: string; // 銷售渠道訂單編號
  createdAt: Date; // 訂單建立時間
  status: OrderStatus; // 訂單狀態
  paymentInfo: any; // 付款資訊
  paymentMethod: string; // 付款方式
  note: object | null;   // 備註
  shipments: Shipment[];
  orderItems: OrderItem[];

  private constructor(
    order: OrderProps
  ) {
    this.id = order.id;
    this.customerEmail = order.customerEmail;
    this.address = order.address;
    this.channel = order.channel;
    this.channelOrderId = order.channelOrderId;
    this.createdAt = order.createdAt;
    this.status = order.status;
    this.paymentInfo = order.paymentInfo;
    this.paymentMethod = order.paymentMethod;
    this.note = order.note;
    this.shipments = order.shipments;
    this.orderItems = order.orderItems;
  }

  static create(order: OrderProps) {
    return {
      order: new Order({
        ...order,
        channelOrderId: order.channel === OrderChannel.DOG_CAT
          ? order.id
          : order.channelOrderId
      }),
      domainEvents: [
        {
          name: 'order_created',
          orderId: order.id,
          oldStatus: null,
          newStatus: OrderStatus.CREATED,
          timestamp: new Date().toISOString()
        }
      ]
    }
  };

  check(
    shipments: (Pick<Shipment, 'id' | 'status' | 'paymentStatus'> & { orderItemIdList: string[] })[]
  ) {
    // 1. 檢查出貨單的 orderItem 數量與訂單的 orderItem 數量是否相符
    const orderItemIdList = shipments.flatMap(shipment => shipment.orderItemIdList);
    if (orderItemIdList.length !== this.orderItems.length)
      throw new Error('出貨單的 orderItem 數量與訂單的 orderItem 數量不相符');
    if (new Set(orderItemIdList).size !== orderItemIdList.length)
      throw new Error('出貨單的 orderItem 有重複');
    // 2. 檢查通過,產出該 order 的 shipments
    const orderItemMap = new Map(this.orderItems.map(orderItem => [orderItem.id, orderItem]));
    this.shipments = shipments.map(shipment => {
      const orderItems = shipment.orderItemIdList.map(id => orderItemMap.get(id));
      return new Shipment({ ...shipment, orderItems });
    });
    // 3. 把 order 的狀態改成 confirmed
    const oldStatus = this.status;
    this.status = OrderStatus.CONFIRMED;
    return [{
      name: 'order_checked',
      orderId: this.id,
      oldStatus,
      newStatus: OrderStatus.CONFIRMED,
      timestamp: new Date().toISOString()
    }];
  };

  /**
   * 出貨
   * 只要旗下有一個 shipment 出貨，order 的狀態就會變成 shipped
   */
  ship(shipmentId: string) {
    // 1. 找到對應的 shipment
    const shipment = this.getShipmentById(shipmentId);
    // 2. 出貨 shipment
    const domainEvents = shipment.ship();
    // 3. 把 order 的狀態改成 shipped
    // 若該訂單下早有出貨的 shipment，則甭送 domain event
    const oldStatus = this.status;
    this.status = OrderStatus.SHIPPED;
    if (oldStatus !== this.status) {
      return [...domainEvents, {
        name: 'order_shipped',
        orderId: this.id,
        oldStatus,
        newStatus: OrderStatus.SHIPPED,
        timestamp: new Date().toISOString()
      }];
    }
    return domainEvents;
  };

  /**
   * 送達
   * 一定要所有 shipment 送達，order 的狀態才會變成 delivered
   */
  deliver(shipmentId: string) {
    // 1. 找到對應的 shipment
    const shipment = this.getShipmentById(shipmentId);
    // 2. 送達 shipment
    const domainEvents = shipment.deliver();
    // 3. 如果所有的 shipment 都 deliver 了，
    // order 才算是 delivered
    const allShipmentsDelivered = this.shipments
      .every(shipment => shipment.status === ShipmentStatus.DELIVERED);
    if (allShipmentsDelivered) {
      const oldStatus = this.status;
      this.status = OrderStatus.DELIVERED;
      return [...domainEvents, {
        name: 'order_delivered',
        orderId: this.id,
        oldStatus,
        newStatus: OrderStatus.DELIVERED,
        timestamp: new Date().toISOString()
      }];
    }
    return domainEvents;
  };

  complete() {
    const oldStatus = this.status;
    this.status = OrderStatus.COMPLETED;
    return [{
      name: 'order_completed',
      orderId: this.id,
      oldStatus,
      newStatus: OrderStatus.COMPLETED,
      timestamp: new Date().toISOString()
    }];
  };

  cancel() {
    // 1. 取消所有 shipment
    const domainEvents = this.shipments
      .flatMap(shipment => shipment.cancel());
    // 2. 把 order 的狀態改成 cancelled
    const oldStatus = this.status;
    this.status = OrderStatus.CANCELLED;
    return [...domainEvents, {
      name: 'order_cancelled',
      orderId: this.id,
      oldStatus,
      newStatus: OrderStatus.CANCELLED,
      timestamp: new Date().toISOString()
    }];
  };

  pay(shipmentId: string, success: boolean) {
    const shipment = this.getShipmentById(shipmentId);
    return shipment.pay(success);
  }

  private getShipmentById(shipmentId: string) {
    const shipment = this.shipments
      .find(shipment => shipment.id === shipmentId);
    if (!shipment)
      throw new Error('Shipment not found');
    return shipment;
  }

}
