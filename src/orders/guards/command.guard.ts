import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrderCommandService } from '../service/command/order-command.service';
import { Transaction } from 'src/shared/database/transaction.interface';
import { OrderRepository } from '../database/order-repository';

@Injectable({ scope: Scope.REQUEST })
export class CommandGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orderCommandService: OrderCommandService,
    @Inject('TRANSACTION') private readonly transaction: Transaction,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const actionName = this.reflector.get('COMMAND', context.getHandler());

    if (actionName) {
      request.transaction = this.transaction;
      this.orderCommandService.setIdentity(request.identity);
      this.orderCommandService.setOrderRepository(new OrderRepository(this.transaction));
      await this.transaction.start();

      try {
        // 檢查 使用者 或 order目前狀態 是否可以執行該動作
        await this.orderCommandService.canExecute(
          request.params.orderId,
          actionName,
        );
        // 得防範不是因為與資料庫互動時而拋的錯，屆時要在 interceptor 接住並 rollback
        request.transaction = this.transaction;
      } catch (error) {
        // 如果 canExecute 失敗，回滾事務並拋出未授權異常
        await this.transaction.rollback();
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
