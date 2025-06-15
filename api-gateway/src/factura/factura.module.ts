import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { facturaClientOptions } from '../grpc-clients/factura.grpc-client';
import { FacturaController } from './factura.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FACTURA_PACKAGE',
        ...facturaClientOptions,
      },
    ]),
  ],
  controllers: [FacturaController],
})
export class FacturaModule {}