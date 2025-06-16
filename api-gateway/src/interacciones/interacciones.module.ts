import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { interaccionesClientOptions } from '../grpc-clients/interacciones.grpc-client';
import { InteraccionesController } from './interacciones.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INTERACCIONES_PACKAGE',
        ...interaccionesClientOptions,
      },
    ]),
  ],
  controllers: [InteraccionesController],
})
export class InteraccionesModule {}
