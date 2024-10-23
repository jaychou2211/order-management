import { Module } from '@nestjs/common';
import { ChannelOrderSyncController } from './channel-order-sync.controller';
import { ChannelOrderSyncService } from './channel-order-sync.service';

@Module({
  imports: [],
  controllers: [ChannelOrderSyncController],
  providers: [ChannelOrderSyncService],
})
export class ChannelOrderSyncModule {}
