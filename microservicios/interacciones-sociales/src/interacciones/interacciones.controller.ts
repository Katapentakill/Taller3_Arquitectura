import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InteraccionService } from './interacciones.service';

@Controller()
export class InteraccionController {
  constructor(private readonly interaccionService: InteraccionService) {}

  @GrpcMethod('InteraccionService', 'CrearComentario')
  async crearComentario(data: { videoId: string; usuarioId: string; texto: string }) {
    return this.interaccionService.crearComentario(data);
  }

  @GrpcMethod('InteraccionService', 'ObtenerComentarios')
  async obtenerComentarios(data: { videoId: string }) {
    const comentarios = await this.interaccionService.obtenerComentarios(data.videoId);
    return { comentarios };
  }

  @GrpcMethod('InteraccionService', 'DarLike')
  async darLike(data: { videoId: string; usuarioId: string }) {
    await this.interaccionService.darLike(data.videoId, data.usuarioId);
    return { message: 'Like registrado (si no existía previamente)' };
  }

  @GrpcMethod('InteraccionService', 'QuitarLike')
  async quitarLike(data: { videoId: string; usuarioId: string }) {
    await this.interaccionService.quitarLike(data.videoId, data.usuarioId);
    return { message: 'Like eliminado (si existía)' };
  }

  @GrpcMethod('InteraccionService', 'ContarLikes')
  async contarLikes(data: { videoId: string }) {
    const total = await this.interaccionService.contarLikes(data.videoId);
    return { total };
  }
}