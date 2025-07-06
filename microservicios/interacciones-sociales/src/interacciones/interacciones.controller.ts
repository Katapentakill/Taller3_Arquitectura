import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InteraccionesService } from './interacciones.service';

@Controller()
export class InteraccionesController {
  constructor(private readonly interaccionesService: InteraccionesService) {}

  @GrpcMethod('InteraccionesService', 'DarLike')
  darLike(data: { videoId: string; token: string }) {
    return this.interaccionesService.darLike(data);
  }

  @GrpcMethod('InteraccionesService', 'SeedInteracciones')
  seedInteracciones(_: any) {
    return this.interaccionesService.seedInteracciones();
  }


  @GrpcMethod('InteraccionesService', 'DejarComentario')
  dejarComentario(data: { videoId: string; content: string; token: string }) {
    return this.interaccionesService.dejarComentario(data);
  }

  @GrpcMethod('InteraccionesService', 'ObtenerInteracciones')
  obtenerInteracciones(data: { videoId: string; token: string }) {
    return this.interaccionesService.obtenerInteracciones(data.videoId, data.token);
  }

  @GrpcMethod('InteraccionesService', 'HealthCheck')
  healthCheck(_: any) {
    return {
      status: 'healthy',
      service: 'interacciones-microservice',
      timestamp: new Date().toISOString(),
    };
  }
}