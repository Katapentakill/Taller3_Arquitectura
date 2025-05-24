import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { listasClientOptions } from '../grpc-clients/listas.grpc-client';
import { ListasController } from './listas.controller';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LISTAS_PACKAGE',
        ...listasClientOptions,
      },
    ]),
  ],
  controllers: [ListasController],
})
export class ListasModule {}