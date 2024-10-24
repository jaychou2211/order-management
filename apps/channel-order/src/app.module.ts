import { Module } from '@nestjs/common';
import { AmazonOrderModule } from './amazon-order/amazon-order.module';

@Module({
  imports: [AmazonOrderModule],
  controllers: [],
  providers: [],
})
export class ChannelOrderModule { }
