import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // ✅ Agrega este log para identificar en qué instancia estás
  console.log('🚀 API Gateway corriendo en puerto', port);
}
bootstrap();
