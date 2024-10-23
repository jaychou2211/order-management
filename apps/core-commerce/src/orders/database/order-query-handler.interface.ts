export interface IOrderQueryHandler {
  findById(id: string): Promise<any>;
}