import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListasService } from './listas.service';

@Controller()
export class ListasController {
  constructor(private readonly listasService: ListasService) {}

  @GrpcMethod('ListasReproduccionService', 'CrearLista')
  crearLista(data: { nombre: string; token: string }) {
    return this.listasService.crearLista(data.nombre, data.token);
  }

  @GrpcMethod('ListasReproduccionService', 'EliminarLista')
  eliminarLista(data: { listaId: string; token: string }) {
    return this.listasService.eliminarLista(data.listaId, data.token);
  }

  @GrpcMethod('ListasReproduccionService', 'ObtenerListas')
  obtenerListas(data: { token: string }) {
    return this.listasService.obtenerListas(data.token);
  }

  @GrpcMethod('ListasReproduccionService', 'AnadirVideo')
  anadirVideo(data: { listaId: string; videoId: string; token: string }) {
    return this.listasService.anadirVideo(data.listaId, data.videoId, data.token);
  }

  @GrpcMethod('ListasReproduccionService', 'EliminarVideo')
  eliminarVideo(data: { listaId: string; videoId: string; token: string }) {
    return this.listasService.eliminarVideo(data.listaId, data.videoId, data.token);
  }

  @GrpcMethod('ListasReproduccionService', 'ObtenerVideosLista')
  obtenerVideosLista(data: { listaId: string; token: string }) {
    return this.listasService.obtenerVideosLista(data.listaId, data.token);
  }
  @GrpcMethod('ListasReproduccionService', 'HealthCheck')
  healthCheck(_: any) {
    return { mensaje: '✅ Microservicio de usuarios operativo' };
  }
}