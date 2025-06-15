import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VideosService } from './videos.service';

@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @GrpcMethod('VideosService', 'CrearVideo')
  crearVideo(data: { title: string; description: string; genre: string; token: string }) {
    return this.videosService.crearVideo(data);
  }

  @GrpcMethod('VideosService', 'ObtenerVideoPorId')
  obtenerVideoPorId(data: { id: string; token: string }) {
    return this.videosService.obtenerVideoPorId(data.id, data.token);
  }

  @GrpcMethod('VideosService', 'ListarVideos')
  listarVideos(data: { token: string }) {
    return this.videosService.listarVideos(data.token);
  }

  @GrpcMethod('VideosService', 'EliminarVideo')
  eliminarVideo(data: { id: string; token: string }) {
    return this.videosService.eliminarVideo(data.id, data.token);
  }

  @GrpcMethod('VideosService', 'ActualizarVideo')
  actualizarVideo(data: { id: string; title: string; description: string; genre: string; token: string }) {
    return this.videosService.actualizarVideo(data);
  }

  @GrpcMethod('VideosService', 'BuscarVideosPorTitulo')
  buscarVideosPorTitulo(data: { titulo: string; token: string }) {
    return this.videosService.buscarPorTitulo(data.titulo, data.token);
  }
}
