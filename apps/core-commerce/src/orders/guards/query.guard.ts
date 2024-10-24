import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrderQueryService } from '../service/query/order-query.service';
import { ContextStorage } from '../context-storage/context.storage';

@Injectable()
export class QueryGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orderQueryService: OrderQueryService,
    private readonly contextStorage: ContextStorage
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const identity = this.contextStorage.getContext('identity');
    const actionName = this.reflector.get('QUERY', context.getHandler());

    await this.orderQueryService.canExecute(
      actionName,
      identity,
    );

    try {
      return true;
    } catch (error) {
      throw new UnauthorizedException;
    }
  }
}