import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from '../Entity/video.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
  ) {}

  async verificarToken(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token.y.rol', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    return payload; // { id, rol }
  }

  async obtenerVideosParaFacturas() {
    const videos = await this.videoModel.find({ status: true }).lean();
    return videos.map(video => ({
      id: video._id.toString(),
      titulo: video.title,
      precio: video.price,
    }));
  }

  async seedVideos() {
    const cantidad = Math.floor(Math.random() * 201) + 400;
    const videos: Partial<Video>[] = [];

    for (let i = 0; i < cantidad; i++) {
      videos.push({
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        genre: faker.music.genre(),
        status: true,
        price: parseInt(faker.commerce.price({ min: 1000, max: 5000 })),
      });
    }

    await this.videoModel.insertMany(videos);

    return { mensaje: `✅ Se crearon ${cantidad} videos aleatorios.` };
  }

  async crearVideo(data: { title: string; description: string; genre: string; token: string }) {
    const usuario = await this.verificarToken(data.token);
    if (usuario.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden crear videos');
    }

    const video = await this.videoModel.create({
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

  async obtenerVideoSimple(id: string) {
    const video = await this.videoModel.findOne({ _id: id, status: true }).lean();
    if (!video) throw new NotFoundException('Video no encontrado');

    return {
      id: video._id.toString(),
      title: video.title,
    };
  }

  async obtenerVideoPorId(id: string, token: string) {
    await this.verificarToken(token);

    const video = await this.videoModel.findOne({ _id: id, status: true }).lean();
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
    await this.verificarToken(token);

    const videos = await this.videoModel.find({ status: true }).lean();

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
    const usuario = await this.verificarToken(token);
    if (usuario.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden eliminar videos');
    }

    const video = await this.videoModel.findById(id);
    if (!video || !video.status) throw new NotFoundException('Video no encontrado');

    video.status = false;
    await video.save();

    return { mensaje: 'Video eliminado correctamente', exito: true };
  }

  async actualizarVideo(data: { id: string; title?: string; description?: string; genre?: string; token: string }) {
    const usuario = await this.verificarToken(data.token);
    if (usuario.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden actualizar videos');
    }

    const video = await this.videoModel.findOne({ _id: data.id, status: true });
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
    await this.verificarToken(token);

    const regex = new RegExp(titulo, 'i');
    const videos = await this.videoModel.find({ title: { $regex: regex }, status: true }).lean();

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