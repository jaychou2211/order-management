import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelOrderSyncService {
  getHello(): string {
    return 'Hello World!';
  }
}
