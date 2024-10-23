import { Injectable } from "@nestjs/common";
import { OrderStatus } from "../../domain/order";
import { OrderCommand } from "./order-command-list";

class StateTransition {
  constructor(
    public readonly actionName: OrderCommand,
    public readonly initState: OrderStatus | null,
    public readonly finalState: OrderStatus | null,
    public readonly allowIdentities: string[]
  ) { }
};

@Injectable()
export class OrderStateMachine {
  private stateTransitionsList: StateTransition[] = [];

  constructor() {
    this.stateTransitionsList.push(
      // 建立訂單
      new StateTransition(OrderCommand.CREATE, null, OrderStatus.CREATED, ["USER", "STAFF", "SYSTEM"]),
      // 確認訂單
      new StateTransition(OrderCommand.CHECK, OrderStatus.CREATED, OrderStatus.CONFIRMED, ["STAFF"]),
      // 出貨
      new StateTransition(OrderCommand.SHIP, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, ["STAFF"]),
      new StateTransition(OrderCommand.SHIP, OrderStatus.SHIPPED, OrderStatus.SHIPPED, ["STAFF"]),
      // 送達訂單內某份出貨單的貨物
      new StateTransition(OrderCommand.DELIVER, OrderStatus.SHIPPED, OrderStatus.SHIPPED, ["PARTNER", "STAFF"]),
      new StateTransition(OrderCommand.DELIVER, OrderStatus.SHIPPED, OrderStatus.DELIVERED, ["PARTNER", "STAFF"]),
      // 完成訂單
      new StateTransition(OrderCommand.COMPLETE, OrderStatus.DELIVERED, OrderStatus.COMPLETED, ["STAFF", "SYSTEM"]),
      // 取消訂單
      new StateTransition(OrderCommand.CANCEL, OrderStatus.CREATED, OrderStatus.CANCELLED, ["USER", "STAFF", "SYSTEM"]),
      new StateTransition(OrderCommand.CANCEL, OrderStatus.CONFIRMED, OrderStatus.CANCELLED, ["USER", "STAFF", "SYSTEM"]),
      new StateTransition(OrderCommand.CANCEL, OrderStatus.SHIPPED, OrderStatus.CANCELLED, ["USER", "STAFF", "SYSTEM"]),
      new StateTransition(OrderCommand.CANCEL, OrderStatus.DELIVERED, OrderStatus.CANCELLED, ["USER", "STAFF", "SYSTEM"]),
      // 付款
      new StateTransition(OrderCommand.PAY, OrderStatus.CONFIRMED, null, ["STAFF", "SYSTEM"]),
      new StateTransition(OrderCommand.PAY, OrderStatus.SHIPPED, null, ["STAFF", "SYSTEM"]),
      new StateTransition(OrderCommand.PAY, OrderStatus.DELIVERED, null, ["STAFF", "SYSTEM"]),
    );
  }

  /**
   * 「僅僅是」檢查是否可以執行動作
   * @param actionName 動作名稱
   * @param currentState 當前狀態
   * @param identity 身分類型
   * @returns 是否可以執行動作
   */
  public canExecute(actionName: OrderCommand, currentState: OrderStatus, identity: string) {
    const finalStates = this.stateTransitionsList
      .filter(stateTransition =>
        stateTransition.actionName === actionName && // 動作符合
        (stateTransition.initState === currentState || stateTransition.initState === null) && // 初始狀態符合 或 沒有限制
        stateTransition.allowIdentities.includes(identity)) // 身分符合
      .map(transition => transition.finalState);
    return finalStates.length
      ? { canExecute: true, initState: currentState, finalStates }
      : { canExecute: false, initState: null, finalStates: null };
  }
};

