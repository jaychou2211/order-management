import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrderCommandService } from '../service/command/order-command.service';
import { Transaction } from '@app/common';
import { OrderRepository } from '../database/order-repository';
import { ContextStorage } from '../context-storage/context.storage';

@Injectable({ scope: Scope.REQUEST })
export class CommandGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orderCommandService: OrderCommandService,
    @Inject('TRANSACTION') private readonly transaction: Transaction,
    private readonly contextStorage: ContextStorage
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // 取得 orderId
    const orderId = context.getType() === 'http'
      ? context.switchToHttp().getRequest().params.id
      : context.switchToRpc().getData().id;
    // 取得 要執行的動作名稱
    const actionName = this.reflector.get('COMMAND', context.getHandler());

    if (actionName) {
      // 得防範不是因為與資料庫互動時而拋的錯，屆時要在 interceptor 接住並 rollback
      this.contextStorage.setContext('transaction', this.transaction);
      this.orderCommandService.setIdentity(this.contextStorage.getContext('identity'));
      this.orderCommandService.setOrderRepository(new OrderRepository(this.transaction));
      await this.transaction.start();

      try {
        // 檢查 使用者 或 order目前狀態 是否可以執行該動作
        await this.orderCommandService.canExecute(
          orderId,
          actionName,
        );
      } catch (error) {
        // 如果 canExecute 失敗，回滾事務並拋出未授權異常
        await this.transaction.rollback();
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
