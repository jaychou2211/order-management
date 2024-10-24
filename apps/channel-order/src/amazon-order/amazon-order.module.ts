import { Module } from '@nestjs/common';
import { AmazonOrderService } from './amazon-order.service';
import { AmazonOrderController } from './amazon-order.controller';
import { DatabaseModule } from '@app/common';
import { AmazonOrder } from './database/amazon-order.model';
import { AmazonOrderRepository } from './database/amazon-order-repository';

@Module({
  imports: [DatabaseModule.forFeature({
    host: 'localhost',
    port: 5440,
    username: 'pizza',
    password: '123456',
    database: 'homequiz',
    entities: [AmazonOrder],
  })],
  controllers: [AmazonOrderController],
  providers: [AmazonOrderService, {
    provide: "AMAZON_ORDER_REPOSITORY",
    useClass: AmazonOrderRepository,
  }],
})
export class AmazonOrderModule { }
