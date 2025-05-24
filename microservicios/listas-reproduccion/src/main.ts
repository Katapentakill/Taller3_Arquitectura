import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'listas',
      protoPath: join(__dirname, '../../../proto/listaReproduccion.proto'),
      url: '0.0.0.0:50054',
    },
  });

  await app.listen();
  console.log('🎵 Microservicio de Listas de Reproducción en ejecución...');
}
bootstrap();