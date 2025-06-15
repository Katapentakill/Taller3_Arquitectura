import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteraccionService } from './interacciones.service';
import { InteraccionController } from './interacciones.controller';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema';
import { Like, LikeSchema } from '../schemas/like.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [InteraccionController],
  providers: [InteraccionService],
})
export class InteraccionModule {}