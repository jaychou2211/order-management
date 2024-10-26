import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ContextStorage } from '../context-storage/context.storage';

@Injectable()
export class OrderInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OrderInterceptor.name);
  constructor(
    private readonly contextStorage: ContextStorage
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const now = Date.now();
    const transaction = this.contextStorage.getContext('transaction');

    return next.handle().pipe(
      tap(async () => {
        const handlerName = context.getHandler().name;
        const delay = Date.now() - now;
        this.logger.log(`${handlerName} - ${delay}ms`);
        if (transaction && !transaction.isReleased) {
          throw new Error('Transaction is not released');
        }
      }),
      catchError(async (error) => {
        // 怕拋錯的時機點不在與資料庫互動，在此防守一波
        if (transaction && !transaction.isReleased) {
          await transaction.rollback();
          await transaction.release();
        }

        // 如果錯誤是 HttpException，直接拋出
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // 對於其他類型的錯誤，可以選擇記錄或轉換為 HttpException
        console.error('Unexpected error occurred:', error);
        return throwError(() => new HttpException('An unexpected error occurred', 500));
      })
    );
  }
}
