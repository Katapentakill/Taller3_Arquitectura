import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListasService } from './listas.service';
import { ListasController } from './listas.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ListaReproduccion } from 'src/entities/lista-reproduccion.entity';
import { ListaVideo } from 'src/entities/lista-video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListaReproduccion, ListaVideo]),
    ClientsModule.register([
    {
      name: 'AUTH_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'auth_queue',
        queueOptions: { durable: true },
      },
    },
    {
      name: 'VIDEOS_RMQ',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'videos_queue',
        queueOptions: { durable: true },
      },
    },
    {
      name: 'USUARIOS_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'usuarios_queue',
        queueOptions: { durable: true },
      },
    },
  ]),
  ],
  controllers: [ListasController],
  providers: [ListasService],
})
export class ListasModule {}