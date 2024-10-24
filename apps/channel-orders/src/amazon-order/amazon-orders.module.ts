import { Module } from '@nestjs/common';
import { AmazonOrderService } from './amazon-orders.service';
import { AmazonOrderController } from './amazon-orders.controller';
import { DatabaseModule } from '@app/common';
import { AmazonOrder } from './Database/amazon-order.model';
import { AmazonOrderRepository } from './Database/amazon-order-repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule.forFeature({
      host: 'localhost',
      port: 5440,
      username: 'pizza',
      password: '123456',
      database: 'homequiz',
      entities: [AmazonOrder],
    }),
    ClientsModule.register([
      {
        name: 'ORDERS_CLIENT',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AmazonOrderController],
  providers: [AmazonOrderService, {
    provide: "AMAZON_ORDER_REPOSITORY",
    useClass: AmazonOrderRepository,
  }],
})
export class AmazonOrderModule { }
