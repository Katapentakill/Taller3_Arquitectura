import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'facturas',
      protoPath: join(__dirname, '../../../proto/facturas.proto'),
      url: '0.0.0.0:50054',
    },
  });

  const rabbitApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'factura_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await grpcApp.listen();
  await rabbitApp.listen();
  console.log('Microservicio de facturas corriendo con gRPC y RabbitMQ');
}
bootstrap();