import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrderQueryService } from '../service/query/order-query.service';

@Injectable()
export class QueryGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orderQueryService: OrderQueryService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const identity = request.identity;
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