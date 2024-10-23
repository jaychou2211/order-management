import { Injectable } from "@nestjs/common";
import { OrderQuery } from "./order-query-list";

class QueryAccess {
  constructor(
    public readonly actionName: OrderQuery,
    public readonly allowIdentities: string[]
  ) { }
};

@Injectable()
export class QueryAccessRule {
  private queryAccessList: QueryAccess[] = [];

  constructor() {
    this.queryAccessList.push(
      // 取得單一訂單
      new QueryAccess(OrderQuery.GET_ORDER, ["USER", "STAFF", "PARTNER", "SYSTEM"])
    );
  };

  /**
 * 「僅僅是」檢查是否可以執行動作
 * @param actionName 動作名稱
 * @param identity 身分類型
 * @returns 是否可以執行動作
 */
  public canExecute(actionName: OrderQuery, identity: string) {
    const queryAccess = this.queryAccessList
      .find(stateTransition =>
        stateTransition.actionName === actionName && // 動作符合
        stateTransition.allowIdentities.includes(identity)) // 身分符合
    return queryAccess
      ? { canExecute: true }
      : { canExecute: false };
  }
}