import { OrderItem } from "./order-item";
import { Shipment, ShipmentStatus } from "./shipment";

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
  'customerId' |
  'address' |
  'status' |
  'paymentInfo' |
  'paymentMethod' |
  'note' |
  'shipments'
>;

type CreateOrderProps = Pick<Order,
  'id' |
  'customerId' |
  'address' |
  'status' |
  'paymentInfo' |
  'paymentMethod' |
  'note'
> & {
  shipments: (
    Pick<Shipment, 'id' | 'status' | 'paymentStatus'> &
    { orderItems: Pick<OrderItem, 'id' | 'productId' | 'quantity' | 'totalPrice'>[] }
  )[];
};

export class Order {
  id: string;
  customerId: string;
  address: string; // 送貨地址
  status: OrderStatus; // 訂單狀態
  paymentInfo: any; // 付款資訊
  paymentMethod: string; // 付款方式
  note: string;   // 備註
  shipments: Shipment[];

  private constructor(
    order: OrderProps
  ) {
    this.id = order.id;
    this.customerId = order.customerId;
    this.address = order.address;
    this.status = order.status;
    this.paymentInfo = order.paymentInfo;
    this.paymentMethod = order.paymentMethod;
    this.note = order.note;
    this.shipments = order.shipments;
  }

  static create(order: CreateOrderProps) {
    //  先把每個 shipment 的 orderItems 的 type 做轉換
    const listOfOrderItems = order.shipments
      .map(shipment => shipment.orderItems)
      .map(orderItems => orderItems.map(orderItem => new OrderItem(orderItem)));
    //  再把每個 shipment 的 type 做轉換（用上剛剛轉換好的 orderItems）
    const shipments = order.shipments.map((shipment, index) => new Shipment({
      ...shipment,
      orderItems: listOfOrderItems[index]
    }));
    //  產出完整的 order
    return {
      order: new Order({
        ...order,
        shipments
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

  check() {
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
