import { OrderItem } from "./order-item";

export enum ShipmentStatus {
  PENDING = 'pending',  // 挑貨中、準備中
  SHIPPED = 'shipped',  // 已發貨
  DELIVERED = 'delivered',  // 已送達
  CANCELLED = 'cancelled',  // 已取消
}

export enum PaymentStatus {
  PENDING = 'pending',  // 待付款
  PAID = 'paid',  // 已付款
  FAILED = 'failed',  // 付款失敗
}

export class Shipment {
  public readonly id: string;
  public status: ShipmentStatus;
  public paymentStatus: PaymentStatus;
  public orderItems: OrderItem[];

  constructor(
    shipment: Pick<Shipment, 'id' | 'status' | 'orderItems' | 'paymentStatus'>
  ) {
    this.id = shipment.id;
    this.status = shipment.status;
    this.orderItems = shipment.orderItems;
    this.paymentStatus = shipment.paymentStatus;
  };

  public ship() {
    const oldStatus = this.status;
    this.status = ShipmentStatus.SHIPPED;
    // domain event
    return [{
      name: 'shipment_shipped',
      shipmentId: this.id,
      oldStatus,
      newStatus: ShipmentStatus.SHIPPED,
      timestamp: new Date().toISOString()
    }];
  };

  public deliver() {
    const oldStatus = this.status;
    this.status = ShipmentStatus.DELIVERED;
    // domain event
    return [{
      name: 'shipment_delivered',
      shipmentId: this.id,
      oldStatus,
      newStatus: ShipmentStatus.DELIVERED,
      timestamp: new Date().toISOString()
    }];
  };

  public cancel() {
    const oldStatus = this.status;
    this.status = ShipmentStatus.CANCELLED;
    // domain event
    if (oldStatus !== ShipmentStatus.CANCELLED) {
      return [{
        name: 'shipment_cancelled',
        shipmentId: this.id,
        oldStatus,
        newStatus: ShipmentStatus.CANCELLED,
        timestamp: new Date().toISOString()
      }];
    }
    return [];
  };

  public pay(success: boolean) {
    const oldPaymentStatus = this.paymentStatus;
    if (oldPaymentStatus === PaymentStatus.PAID)
      throw new Error('Shipment already paid');
    if (success) {
      this.paymentStatus = PaymentStatus.PAID;
      return [{
        name: 'shipment_payment_success',
        shipmentId: this.id,
        oldPaymentStatus,
        newPaymentStatus: PaymentStatus.PAID,
        timestamp: new Date().toISOString()
      }];
    } else {
      this.paymentStatus = PaymentStatus.FAILED;
      return [{
        name: 'shipment_payment_failed',
        shipmentId: this.id,
        oldPaymentStatus,
        newPaymentStatus: PaymentStatus.FAILED,
        timestamp: new Date().toISOString()
      }];
    }
  }
}
