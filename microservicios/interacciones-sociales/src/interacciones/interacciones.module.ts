import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteraccionesController } from './interacciones.controller';
import { InteraccionesService } from './interacciones.service';
import { Like, LikeSchema } from '../schemas/like.schema';
import { Comment, CommentSchema } from '../schemas/comment.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'usuarios_queue',
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
    ]),
  ],
  controllers: [InteraccionesController],
  providers: [InteraccionesService],
})
export class InteraccionesModule {}