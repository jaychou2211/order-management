import { NestFactory } from '@nestjs/core';
import { ChannelOrderModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ChannelOrderModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
