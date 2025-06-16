import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MonitoreoController } from './monitoreo.controller';
import { monitoreoClientOptions } from '../grpc-clients/monitoreo.grpc-client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MONITOREO_PACKAGE',
        ...monitoreoClientOptions,
      },
    ]),
  ],
  controllers: [MonitoreoController],
})
export class MonitoreoModule {}
