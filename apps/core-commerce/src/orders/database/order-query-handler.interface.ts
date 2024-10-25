export interface IOrderQueryHandler {
  findById(id: string): Promise<any>;
  getOrdersHistory(id: string): Promise<any[]>;
}