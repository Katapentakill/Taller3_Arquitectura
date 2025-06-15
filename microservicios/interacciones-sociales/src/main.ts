import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'interacciones',
      protoPath: join(__dirname, '../../../proto/interacciones.proto'),
      url: '0.0.0.0:50056',
    },
  });

  await grpcApp.listen();
  console.log('Microservicio de interacciones sociales corriendo (gRPC + MongoDB)');
}
bootstrap();