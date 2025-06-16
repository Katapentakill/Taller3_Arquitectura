import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios'; // ✅ AÑADE ESTA LÍNEA

@Module({
  imports: [
    HttpModule, // ✅ IMPORTA HttpModule AQUÍ
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
