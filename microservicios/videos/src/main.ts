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
      url: '0.0.0.0:50055', 
    },
  });

  const rmApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'videos_queue',
      queueOptions: { durable: true },
    },
  });

  await grpcApp.listen();
  await rmApp.listen();
  console.log('Microservices está funcionando (gRPC + RabbitMQ)');
}
bootstrap();
