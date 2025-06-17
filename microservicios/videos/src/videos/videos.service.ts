import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Video, VideoDocument } from '../Entity/video.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
  ) {}

  async verificarToken(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token.y.rol', { token }),
    ).catch((err) => {
      this.logger.error('Error verificando token', err);
      throw new UnauthorizedException('Token inválido');
    });

    return payload; // { id, rol }
  }

  async obtenerVideosParaFacturas() {
    try {
      const videos = await this.videoModel.find({ status: true }).lean();
      return videos.map(video => ({
        id: video._id.toString(),
        titulo: video.title,
        precio: video.price,
      }));
    } catch (err) {
      this.logger.error('Error en obtenerVideosParaFacturas', err);
      throw new Error('Error interno al obtener videos para facturas');
    }
  }

  async seedVideos() {
    try {
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
    } catch (err) {
      this.logger.error('Error en seedVideos', err);
      throw new Error('Error interno al generar videos');
    }
  }

  async crearVideo(data: { title: string; description: string; genre: string; price: number; token: string }) {
    try {
      const usuario = await this.verificarToken(data.token);
      if (usuario.rol !== 'Administrador') {
        throw new ForbiddenException('Solo administradores pueden crear videos');
      }

      const video = await this.videoModel.create({
        title: data.title,
        description: data.description,
        genre: data.genre,
        price: data.price,
        status: true,
      });

      return {
        id: video._id.toString(),
        title: video.title ?? '',
        description: video.description ?? '',
        genre: video.genre ?? '',
        price: video.price ?? 0,
        status: video.status?.toString() ?? 'false',
      };
    } catch (err) {
      this.logger.error('Error en crearVideo', err);
      throw new Error('Error interno al crear video');
    }
  }

  async obtenerVideoSimple(id: string) {
    try {
      const video = await this.videoModel.findOne({ _id: id, status: true }).lean();
      if (!video) throw new NotFoundException('Video no encontrado');

      return {
        id: video._id.toString(),
        title: video.title,
      };
    } catch (err) {
      this.logger.error('Error en obtenerVideoSimple', err);
      throw err;
    }
  }

  async obtenerVideoPorId(id: string, token: string) {
    try {
      await this.verificarToken(token);
      if (!isValidObjectId(id)) {
        this.logger.warn('ID no válido:', id);
        throw new NotFoundException('ID de video inválido');
      }

      const video = await this.videoModel.findOne({ _id: id, status: true }).lean();
      if (!video) throw new NotFoundException('Video no encontrado');

      return {
        id: video._id.toString(),
        title: video.title ?? '',
        description: video.description ?? '',
        genre: video.genre ?? '',
        price: video.price ?? 0,
        status: video.status?.toString() ?? 'false',
      };
    } catch (err) {
      this.logger.error('Error en obtenerVideoPorId', err);
      throw err;
    }
  }

  async listarVideos(token: string) {
    try {
      await this.verificarToken(token);
      const videos = await this.videoModel.find({ status: true }).lean();

      return {
        videos: videos.map(v => ({
          id: v._id.toString(),
          title: v.title ?? '',
          description: v.description ?? '',
          genre: v.genre ?? '',
          price: v.price ?? 0,
          status: v.status?.toString() ?? 'false',
        })),
      };
    } catch (err) {
      this.logger.error('Error en listarVideos', err);
      throw new Error('Error interno al listar videos');
    }
  }

  async eliminarVideo(id: string, token: string) {
    try {
      const usuario = await this.verificarToken(token);
      if (usuario.rol !== 'Administrador') {
        throw new ForbiddenException('Solo administradores pueden eliminar videos');
      }

      const video = await this.videoModel.findById(id);
      if (!video || !video.status) throw new NotFoundException('Video no encontrado');

      video.status = false;
      await video.save();

      return { mensaje: 'Video eliminado correctamente', exito: true };
    } catch (err) {
      this.logger.error('Error en eliminarVideo', err);
      throw err;
    }
  }

  async actualizarVideo(data: { id: string; title?: string; description?: string; genre?: string; price?: number; token: string }) {
    try {
      const usuario = await this.verificarToken(data.token);
      if (usuario.rol !== 'Administrador') {
        throw new ForbiddenException('Solo administradores pueden actualizar videos');
      }

      const video = await this.videoModel.findOne({ _id: data.id, status: true });
      if (!video) throw new NotFoundException('Video no encontrado');

      if (data.title !== undefined) video.title = data.title;
      if (data.description !== undefined) video.description = data.description;
      if (data.genre !== undefined) video.genre = data.genre;
      if (data.price !== undefined) video.price = data.price;

      await video.save();

      return {
        id: video._id.toString(),
        title: video.title ?? '',
        description: video.description ?? '',
        genre: video.genre ?? '',
        price: video.price ?? 0,
        status: video.status?.toString() ?? 'false',
      };
    } catch (err) {
      this.logger.error('Error en actualizarVideo', err);
      throw err;
    }
  }

  async buscarPorTitulo(titulo: string, token: string) {
    try {
      await this.verificarToken(token);
      const regex = new RegExp(titulo, 'i');
      const videos = await this.videoModel.find({ title: { $regex: regex }, status: true }).lean();

      return {
        videos: videos.map(v => ({
          id: v._id.toString(),
          title: v.title ?? '',
          description: v.description ?? '',
          genre: v.genre ?? '',
          price: v.price ?? 0,
          status: v.status?.toString() ?? 'false',
        })),
      };
    } catch (err) {
      this.logger.error('Error en buscarPorTitulo', err);
      throw new Error('Error interno al buscar videos');
    }
  }
}