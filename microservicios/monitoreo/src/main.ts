import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'monitoreo',
      protoPath: join(__dirname, '../../../proto/monitoreo.proto'),
      url: '0.0.0.0:50058',
    },
  });

  const rmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'monitoreo_queue',
      queueOptions: { durable: true },
    },
  });

  await grpcApp.listen();
  await rmqApp.listen();

  console.log('✅ Microservicio de Monitoreo corriendo...');
}
bootstrap();