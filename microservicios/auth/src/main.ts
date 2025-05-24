import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // ✅ App principal como HTTP (necesario para @Cron)
  const app = await NestFactory.create(AppModule);

  // 🟢 gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: '0.0.0.0:50052',
    },
  });

  // 🟡 RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002); // Puerto HTTP (aunque no expongas endpoints)

  console.log('✅ Auth microservice is running (gRPC + RabbitMQ + Schedule)');
}
bootstrap();