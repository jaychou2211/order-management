import { Test, TestingModule } from '@nestjs/testing';
import { ChannelOrderSyncController } from './channel-order-sync.controller';
import { ChannelOrderSyncService } from './channel-order-sync.service';

describe('ChannelOrderSyncController', () => {
  let channelOrderSyncController: ChannelOrderSyncController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChannelOrderSyncController],
      providers: [ChannelOrderSyncService],
    }).compile();

    channelOrderSyncController = app.get<ChannelOrderSyncController>(ChannelOrderSyncController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(channelOrderSyncController.getHello()).toBe('Hello World!');
    });
  });
});
