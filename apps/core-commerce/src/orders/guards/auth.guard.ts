import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException;

    try {
      request.identity = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException;
    }
  }
}
