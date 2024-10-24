import { Module } from '@nestjs/common';
import { OrderCommandService } from './service/command/order-command.service';
import { OrdersController } from './orders.controller';
import { OrderStateMachine } from './service/command/order-state-machine';
import { DatabaseModule } from '@app/common';
import { OrderQueryService } from './service/query/order-query.service';
import { QueryAccessRule } from './service/query/query-access-rule';
import { OrderQueryHandler } from './database/order-query-handler';
import { OrderModel } from './database/models/order.model';
import { ShipmentModel } from './database/models/shipment.model';
import { OrderItemModel } from './database/models/order-item.model';
import { ContextStorage } from './context-storage/context.storage';

@Module({
  imports: [DatabaseModule.forFeature({
    host: 'localhost',
    port: 5440,
    username: 'pizza',
    password: '123456',
    database: 'homequiz',
    entities: [OrderModel, ShipmentModel, OrderItemModel],
  })],
  controllers: [OrdersController],
  providers: [
    OrderCommandService, OrderStateMachine,
    OrderQueryService, QueryAccessRule, {
      provide: 'ORDER_QUERY_HANDLER',
      useClass: OrderQueryHandler
    },
    ContextStorage
  ],
  exports: [],
})
export class OrdersModule { }
