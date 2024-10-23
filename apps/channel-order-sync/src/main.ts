import { NestFactory } from '@nestjs/core';
import { ChannelOrderSyncModule } from './channel-order-sync.module';

async function bootstrap() {
  const app = await NestFactory.create(ChannelOrderSyncModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
