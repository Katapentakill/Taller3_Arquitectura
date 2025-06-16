import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../schemas/like.schema';
import { Comment } from '../schemas/comment.schema';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';

@Injectable()
export class InteraccionesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @Inject('RABBITMQ_SERVICE') private authClient: ClientProxy,
    @Inject('VIDEOS_RMQ') private readonly videosClient: ClientProxy,
  ) {}

  private async verificarTokenYExtraerUsuario(token: string): Promise<{ id: string; email: string }> {
    if (!token) throw new UnauthorizedException('Token requerido');
    const payload = await lastValueFrom(
      this.authClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });
    return { id: payload.sub, email: payload.email };
  }

  async seedInteracciones(): Promise<{ mensaje: string }> {
    const videos: any[] = await lastValueFrom(
      this.videosClient.send('obtener.videos', {}),
    );

    if (!Array.isArray(videos) || videos.length === 0) {
      throw new Error('No se pudieron obtener videos');
    }

    const interaccionesGeneradas: Promise<any>[] = [];

    for (const video of videos.slice(0, 10)) {
      const videoId = video.id;

      const cantidadLikes = faker.number.int({ min: 50, max: 100 });
      const cantidadComentarios = faker.number.int({ min: 20, max: 50 });

      for (let i = 0; i < cantidadLikes; i++) {
        const like = new this.likeModel({
          videoId,
          userId: faker.string.uuid(),
          userEmail: faker.internet.email(),
        });
        interaccionesGeneradas.push(like.save());
      }

      for (let i = 0; i < cantidadComentarios; i++) {
        const comment = new this.commentModel({
          videoId,
          userId: faker.string.uuid(),
          userEmail: faker.internet.email(),
          content: faker.lorem.sentence(),
        });
        interaccionesGeneradas.push(comment.save());
      }
    }

    await Promise.all(interaccionesGeneradas);

    return {
      mensaje: '✅ Interacciones generadas correctamente (likes y comentarios aleatorios)',
    };
  }

  async darLike(data: { videoId: string; token: string }) {
    const usuario = await this.verificarTokenYExtraerUsuario(data.token);

    const like = new this.likeModel({
      videoId: data.videoId,
      userId: usuario.id,
      userEmail: usuario.email,
    });

    await like.save();
    return { mensaje: '✅ Like registrado con éxito' };
  }

  async dejarComentario(data: { videoId: string; content: string; token: string }) {
    const usuario = await this.verificarTokenYExtraerUsuario(data.token);

    const comentario = new this.commentModel({
      videoId: data.videoId,
      userId: usuario.id,
      userEmail: usuario.email,
      content: data.content,
    });

    await comentario.save();
    return { mensaje: '💬 Comentario registrado con éxito' };
  }

  async obtenerInteracciones(videoId: string, token: string) {
    await this.verificarTokenYExtraerUsuario(token);

    const likes = await this.likeModel.find({ videoId }).lean();
    const comentarios = await this.commentModel.find({ videoId }).lean();

    return {
      likes,
      comentarios,
    };
  }
}
