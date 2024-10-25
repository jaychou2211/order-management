import { NestFactory } from '@nestjs/core';
import { ChannelOrderModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ChannelOrderModule);
  await app.listen(3000);
}
bootstrap();
