import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextStorage } from '../context-storage/context.storage';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly contextStorage: ContextStorage
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const authorization = context.getType() === 'http'
      ? context.switchToHttp().getRequest().headers.authorization // http
      : context.switchToRpc().getData().Authorization; // rpc
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException;

    try {
      this.contextStorage.setContext('identity', token);
      return true;
    } catch (error) {
      throw new UnauthorizedException;
    }
  }
}
