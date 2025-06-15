import { Injectable, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from '../Entity/video.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
  ) {}

  async crearVideo(data: { title: string; description: string; genre: string; token: string }) {
    await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token: data.token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const video: VideoDocument = await this.videoModel.create({
      title: data.title,
      description: data.description,
      genre: data.genre,
      status: true,
    });

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      genre: video.genre,
      status: video.status.toString(),
    };
  }

  async obtenerVideoPorId(id: string, token: string) {
    await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const video = await this.videoModel.findById(id).lean();
    if (!video) throw new NotFoundException('Video no encontrado');

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      genre: video.genre,
      status: video.status.toString(),
    };
  }

  async listarVideos(token: string) {
    await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const videos = await this.videoModel.find().lean();

    return {
      videos: videos.map(v => ({
        id: v._id.toString(),
        title: v.title,
        description: v.description,
        genre: v.genre,
        status: v.status.toString(),
      })),
    };
  }

  async eliminarVideo(id: string, token: string) {
    await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const video = await this.videoModel.findById(id);
    if (!video) throw new NotFoundException('Video no encontrado');

    await this.videoModel.findByIdAndDelete(id);

    return { mensaje: 'Video eliminado correctamente', exito: true };
  }

  async actualizarVideo(data: { id: string; title?: string; description?: string; genre?: string; token: string }) {
  await lastValueFrom(
    this.rabbitMQClient.send('verificar.token', { token: data.token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const video = await this.videoModel.findById(data.id);
  if (!video) throw new NotFoundException('Video no encontrado');

  if (data.title !== undefined) video.title = data.title;
  if (data.description !== undefined) video.description = data.description;
  if (data.genre !== undefined) video.genre = data.genre;

  await video.save();

  return {
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    genre: video.genre,
    status: video.status.toString(),
  };
}


  async buscarPorTitulo(titulo: string, token: string) {
  await lastValueFrom(
    this.rabbitMQClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const cleanTitulo = (titulo ?? '').trim();
  const regex = new RegExp(`^${cleanTitulo}$`, 'i');

  console.log('[Service] → buscarPorTitulo → regex:', regex);

  const videos = await this.videoModel.find({ title: regex }).lean();

  return {
    videos: videos.map(v => ({
      id: v._id.toString(),
      title: v.title,
      description: v.description,
      genre: v.genre,
      status: v.status.toString(),
    })),
  };
}



}

