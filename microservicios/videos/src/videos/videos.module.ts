import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../Entity/video.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
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
      name: 'RABBITMQ_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'usuarios_queue',
        queueOptions: { durable: true },
      },
    },
  ]),
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}