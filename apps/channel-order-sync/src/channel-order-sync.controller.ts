import { Controller, Get } from '@nestjs/common';
import { ChannelOrderSyncService } from './channel-order-sync.service';

@Controller()
export class ChannelOrderSyncController {
  constructor(private readonly channelOrderSyncService: ChannelOrderSyncService) {}

  @Get()
  getHello(): string {
    return this.channelOrderSyncService.getHello();
  }
}
