export class OrderItem {
  public id: string;
  public productId: string;
  public quantity: number;
  public totalPrice: number;
  public note: object | null;

  constructor(
    orderItem: Pick<OrderItem, 'id' | 'productId' | 'quantity' | 'totalPrice' | 'note'>
  ) {
    this.id = orderItem.id;
    this.productId = orderItem.productId;
    this.quantity = orderItem.quantity;
    this.totalPrice = orderItem.totalPrice;
    this.note = orderItem.note;
  }
}