import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from '../entity/factura.entity';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'usuarios_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'VIDEOS_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'videos_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
