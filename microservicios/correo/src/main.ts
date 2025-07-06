import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'correo_queue',
      queueOptions: { durable: true },
    },
  });

  await app.listen(); // ✅ Sin argumentos
  console.log('📬 Microservicio de Correo esperando eventos en RabbitMQ...');
}
bootstrap();
