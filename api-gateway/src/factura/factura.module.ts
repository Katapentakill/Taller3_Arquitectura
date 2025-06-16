import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { facturaClientOptions } from '../grpc-clients/factura.grpc-client';
import { FacturasController } from './factura.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FACTURAS_PACKAGE', // ✅ CORREGIDO para que coincida con el controlador
        ...facturaClientOptions,
      },
    ]),
  ],
  controllers: [FacturasController],
})
export class FacturaModule {}
