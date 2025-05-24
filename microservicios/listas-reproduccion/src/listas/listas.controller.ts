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
}