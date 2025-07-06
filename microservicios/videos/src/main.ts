import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'videos',
      protoPath: join(__dirname, '../../../proto/videos.proto'),
      url: '0.0.0.0:50059',
    },
  });

  const rmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'],
      queue: 'videos_queue',
      queueOptions: { durable: true },
    },
  });

  await grpcApp.listen();
  await rmqApp.listen();
  console.log('Videos microservice is running (gRPC + RabbitMQ)...');
}

bootstrap();
