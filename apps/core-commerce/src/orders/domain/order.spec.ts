import { Order, OrderStatus } from './order';
import { ShipmentStatus, PaymentStatus } from './shipment';

describe('All rules of order', () => {
  let mockOrder;

  beforeEach(() => {
    mockOrder = {
      id: '123',
      customerId: 'CUST-6789',
      address: '123 Main St, Taipei, Taiwan 10001',
      createdAt: '2023-05-15T10:30:00Z',
      status: OrderStatus.CREATED,
      paymentInfo: {
        cardType: 'Visa',
        last4Digits: '4321'
      },
      paymentMethod: 'credit_card',
      note: 'Please leave the package at the front door',
      shipments: [
        {
          id: 'SHIP-001',
          status: ShipmentStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          orderItems: [
            {
              id: 'ITEM-001',
              productId: 'PROD-001',
              quantity: 2,
              totalPrice: 1000
            },
            {
              id: 'ITEM-002',
              productId: 'PROD-002',
              quantity: 1,
              totalPrice: 500
            }
          ]
        },
        {
          id: 'SHIP-002',
          status: ShipmentStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          orderItems: [
            {
              id: 'ITEM-003',
              productId: 'PROD-003',
              quantity: 3,
              totalPrice: 1500
            }
          ]
        }
      ]
    };
  });

  describe('Create an order', () => {
    it('Create an order', () => {
      // setup
      const orderData = { ...mockOrder };
      // action 
      const { order, domainEvents } = Order.create(orderData);
      // assert
      expect(order.id).toBe(mockOrder.id);
      expect(order.customerId).toBe(mockOrder.customerId);
      expect(domainEvents[0].name).toBe('order_created');
      expect(domainEvents[0].newStatus).toBe(OrderStatus.CREATED);
    });
  });

  describe('Check an order', () => {
    it('Internal staff confirm an order', () => {
      // setup
      const orderData = { ...mockOrder };
      const {order} = Order.create(orderData);
      // action
      const [domainEvent] = order.check();
      // assert
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(domainEvent.name).toBe('order_checked');
      expect(domainEvent.newStatus).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('Ship a specific shipment within an order', () => {
    it('Ship the first shipment', () => {
      // setup
      const { order } = Order.create(mockOrder);
      // action
      const [shipmentEvent, orderEvent] = order.ship('SHIP-001');
      // assert
      // 檢查訂單的狀態
      expect(order.status).toBe(OrderStatus.SHIPPED);
      expect(orderEvent.name).toBe('order_shipped');
      expect(orderEvent.newStatus).toBe(OrderStatus.SHIPPED);
      // 檢查出貨單(SHIP-001)的狀態
      expect(order.shipments[0].status).toBe(ShipmentStatus.SHIPPED);
      expect(shipmentEvent.name).toBe('shipment_shipped');
      expect(shipmentEvent.newStatus).toBe(ShipmentStatus.SHIPPED);
    });
    it('Ship the second shipment', () => {
      // setup
      const { order } = Order.create(mockOrder);
      order.ship('SHIP-001');
      // action
      const domainEvents = order.ship('SHIP-002');
      // assert
      // 我關注的是：
      // 訂單狀態早已是 SHIPPED，所以毋須再送出 order_shipped 這個 domain event
      expect(domainEvents.length).toBe(1);
      expect(domainEvents[0].name).toBe('shipment_shipped');
    });
  });

  describe('Deliver a specific shipment within an order', () => {
    it('Deliver the first shipment', () => {
      // setup
      const { order } = Order.create(mockOrder);
      // action
      const domainEvents = order.deliver('SHIP-001');
      // assert
      // 我關注的是：
      // 只根據「單一」出貨單送達，訂單狀態不變成 DELIVERED
      expect(domainEvents.length).toBe(1);
      expect(domainEvents[0].name).toBe('shipment_delivered');
      expect(domainEvents[0].newStatus).toBe(ShipmentStatus.DELIVERED);
      expect(order.status).not.toBe(OrderStatus.DELIVERED);
      expect(order.shipments[0].status).toBe(ShipmentStatus.DELIVERED);

    });
    it('Deliver the second shipment', () => {
      // setup
      const { order } = Order.create(mockOrder);
      order.deliver('SHIP-001');
      // action
      const [shipmentEvent, orderEvent] = order.deliver('SHIP-002');
      // assert
      // 我關注的是：
      // 根據該訂單內的第2份出貨單也送達，訂單狀態得變為 DELIVERED
      expect(shipmentEvent.name).toBe('shipment_delivered');
      expect(orderEvent.name).toBe('order_delivered');
      expect(order.status).toBe(OrderStatus.DELIVERED);
      expect(order.shipments[1].status).toBe(ShipmentStatus.DELIVERED);
    });
  });

  describe('Complete an order', () => {
    it('Complete an order', () => {
      // setup
      const { order } = Order.create(mockOrder);
      // action
      const [domainEvent] = order.complete();
      // assert
      expect(domainEvent.name).toBe('order_completed');
      expect(domainEvent.newStatus).toBe(OrderStatus.COMPLETED);
      expect(order.status).toBe(OrderStatus.COMPLETED);
    });
  });

  describe('Cancel an order', () => {
    it('All its shipments are also cancelled', () => {
      // setup
      const { order } = Order.create(mockOrder);
      // action
      const domainEvents = order.cancel();
      // assert
      expect(domainEvents.length).toBe(3);
      expect(domainEvents[0].name).toBe('shipment_cancelled');
      expect(domainEvents[1].name).toBe('shipment_cancelled');
      expect(domainEvents[2].name).toBe('order_cancelled');
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.shipments[0].status).toBe(ShipmentStatus.CANCELLED);
      expect(order.shipments[1].status).toBe(ShipmentStatus.CANCELLED);
    });
  });

  describe('Pay for a specific shipment within an order', () => {
    it('Pay for a shipment', () => {
      // setup
      const { order } = Order.create(mockOrder);
      // action
      const domainEvents = order.pay('SHIP-001', true);
      // assert
      expect(domainEvents.length).toBe(1);
      expect(domainEvents[0].name).toBe('shipment_payment_success');
      expect(order.shipments[0].paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
})