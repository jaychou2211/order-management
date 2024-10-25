import { Order, OrderStatus } from './order';
import { ShipmentStatus, PaymentStatus, Shipment } from './shipment';

const createExistingMockOrder = (
  mockOrder: any,
  mockShipmentDtoList: any[]
) => {
  const shipments = mockShipmentDtoList
    .map(shipmentData => new Shipment(shipmentData));
  const { order } = Order.create({ ...mockOrder, shipments });
  return order;
};

describe('All rules of order', () => {
  let mockOrder, mockShipmentDtoList, mockOrderItems;

  beforeEach(() => {
    mockOrderItems = [
      {
        "id": '2b6d4d1b-6823-454c-b0bb-0a83869dee04',
        "productId": "PROD-001",
        "quantity": 2,
        "totalPrice": 1000
      },
      {
        "id": '014ae485-496c-4263-baa9-3510b946b5d9',
        "productId": "PROD-002",
        "quantity": 1,
        "totalPrice": 500
      },
      {
        "id": 'd56e26a0-bd3d-447b-b29c-147370856bb4',
        "productId": "PROD-003",
        "quantity": 3,
        "totalPrice": 1500
      }
    ];
    mockOrder = {
      "id": '3b92ac4e-33aa-4d5d-a81a-73b554cbc9f3',
      "customerId": "ed03fdf5-8ce4-4a66-b76b-8220e5da3b29",
      "address": {
        "name": "John Doe",
        "addressLine1": "123 Main St",
        "city": "Seattle",
        "stateOrRegion": "WA",
        "postalCode": "98101",
        "countryCode": "US"
      },
      "channel": "dog_cat",
      "channelOrderId": null,
      "createdAt": "2023-05-15T10:30:00Z",
      "status": "created",
      "paymentInfo": {
        "cardType": "Visa",
        "last4Digits": "4321"
      },
      "paymentMethod": "credit_card",
      "note": "Please leave the package at the front door",
      "orderItems": mockOrderItems
    };
    mockShipmentDtoList = [
      {
        "id": 'da9f16d8-9512-4565-9832-882823c42946',
        "status": "pending",
        "paymentStatus": "pending",
        "orderItemIdList": mockOrderItems.slice(0, 1)
      },
      {
        "id": 'a9b6a823-45a5-4bdc-8ee4-0b1b77fa5d96',
        "status": "pending",
        "paymentStatus": "pending",
        "orderItemIdList": mockOrderItems.slice(1)
      }
    ]
  });

  describe('Create an order', () => {
    it('Create an order', () => {
      // setup
      // action 
      const { order, domainEvents } = Order.create(mockOrder);
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
      const shipmentDtoList = mockShipmentDtoList;
      const { order } = Order.create(mockOrder);
      // action
      const [domainEvent] = order.check(shipmentDtoList);
      // assert
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(domainEvent.name).toBe('order_checked');
      expect(domainEvent.newStatus).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('Ship a specific shipment within an order', () => {
    it('Ship the first shipment', () => {
      // setup
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
      // action
      const [shipmentEvent, orderEvent] = order.ship(mockShipmentDtoList[0].id);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
      order.ship(mockShipmentDtoList[0].id);
      // action
      const domainEvents = order.ship(mockShipmentDtoList[1].id);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
      // action
      const domainEvents = order.deliver(mockShipmentDtoList[0].id);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
      order.deliver(mockShipmentDtoList[0].id);
      // action
      const [shipmentEvent, orderEvent] = order.deliver(mockShipmentDtoList[1].id);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
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
      const order = createExistingMockOrder(mockOrder, mockShipmentDtoList);
      // action
      const domainEvents = order.pay(mockShipmentDtoList[0].id, true);
      // assert
      expect(domainEvents.length).toBe(1);
      expect(domainEvents[0].name).toBe('shipment_payment_success');
      expect(order.shipments[0].paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
})