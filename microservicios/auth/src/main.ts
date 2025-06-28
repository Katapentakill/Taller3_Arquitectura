import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🟡 RabbitMQ microservice (sigue funcionando para eventos)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'], // ✅ Nombre del contenedor
      queue: 'auth_queue',
      queueOptions: { durable: true },
    },
  });


  await app.startAllMicroservices();
  await app.listen(3002); // HTTP API activa
  console.log('✅ Auth microservice is running (HTTP + RabbitMQ)');
}
bootstrap();