import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { VideosService } from './videos.service';

@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @GrpcMethod('VideosService', 'SeedVideos')
  seedVideos(_: any) {
    return this.videosService.seedVideos();
  }

  @EventPattern('obtener.video.por.id') // Evento que usa listas de reproducción
  async handleObtenerVideoPorId(data: { id: string }) {
    return await this.videosService.obtenerVideoSimple(data.id);
  }

  @EventPattern('obtener.videos') // este es el evento que escuchará factura
  async handleObtenerVideos() {
    return await this.videosService.obtenerVideosParaFacturas();
  }

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
