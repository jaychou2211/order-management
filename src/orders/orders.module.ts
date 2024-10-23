import { Module } from '@nestjs/common';
import { OrderCommandService } from './service/command/order-command.service';
import { OrdersController } from './orders.controller';
import { OrderStateMachine } from './service/command/order-state-machine';
import { DatabaseModule } from 'src/shared/database/database.module';
import { OrderQueryService } from './service/query/order-query.service';
import { QueryAccessRule } from './service/query/query-access-rule';
import { OrderQueryHandler } from './database/order-query-handler';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [
    OrderCommandService, OrderStateMachine,
    OrderQueryService, QueryAccessRule, OrderQueryHandler
  ],
  exports: [],
})
export class OrdersModule {}
