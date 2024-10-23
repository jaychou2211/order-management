export class OrderItem {
  public id: string;
  public productId: string;
  public quantity: number;
  public totalPrice: number;

  constructor(
    orderItem: Pick<OrderItem, 'id' | 'productId' | 'quantity' | 'totalPrice'>
  ) {
    this.id = orderItem.id;
    this.productId = orderItem.productId;
    this.quantity = orderItem.quantity;
    this.totalPrice = orderItem.totalPrice;
  }
}