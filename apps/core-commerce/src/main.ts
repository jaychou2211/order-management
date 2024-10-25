import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'core-commerce',
      port: 3001
    }
  });
  const pipe =new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
    validationError: { target: false, value: false },
    exceptionFactory: (errors) => {
      console.log('Validation errors:');
      console.dir(errors, { depth: Infinity });
      return new BadRequestException(errors);
    },
  });
  app.useGlobalPipes(pipe);
  microservice.useGlobalPipes(pipe);
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
