import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'usuarios',
      protoPath: join(__dirname, '../../../proto/usuarios.proto'),
      url: '0.0.0.0:50051',
    },
  });

  const rmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'], // ← CAMBIAR 'localhost' por el nombre del contenedor
      queue: 'usuarios_queue',
      queueOptions: { durable: true },
    },
  });

  await grpcApp.listen();
  await rmqApp.listen();
  console.log('Usuarios microservice is running (gRPC + RabbitMQ)...');
}

bootstrap();
