import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
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
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USUARIOS_SERVICE') private readonly usuariosClient: ClientProxy,
  ) {}

  async obtenerVideosParaFacturas() {
    const videos = await this.videoModel.find({ status: true }).lean();
    return videos.map(video => ({
      id: video._id.toString(),
      titulo: video.title,
      precio: video.price,
    }));
  }

  private async verificarTokenYRol(token: string): Promise<{ id: string; rol: string }> {
    const payload = await lastValueFrom(
      this.authClient.send('verificar.token', { token })
    ).catch(() => { throw new UnauthorizedException('Token inválido'); });

    const usuario = await lastValueFrom(
      this.usuariosClient.send('obtener.usuario', { id: payload.sub, token })
    ).catch(() => { throw new UnauthorizedException('Usuario no válido o sin permisos'); });

    return usuario;
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
    const usuario = await this.verificarTokenYRol(data.token);
    if (usuario.rol !== 'ADMIN') throw new UnauthorizedException('Solo administradores pueden crear videos');

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
    await this.verificarTokenYRol(token);

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
    await this.verificarTokenYRol(token);

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
    const usuario = await this.verificarTokenYRol(token);
    if (usuario.rol !== 'ADMIN') throw new UnauthorizedException('Solo administradores pueden eliminar videos');

    const video = await this.videoModel.findById(id);
    if (!video || !video.status) throw new NotFoundException('Video no encontrado');

    video.status = false;
    await video.save();

    return { mensaje: 'Video eliminado correctamente', exito: true };
  }

  async actualizarVideo(data: { id: string; title?: string; description?: string; genre?: string; token: string }) {
    const usuario = await this.verificarTokenYRol(data.token);
    if (usuario.rol !== 'ADMIN') throw new UnauthorizedException('Solo administradores pueden actualizar videos');

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
    await this.verificarTokenYRol(token);

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