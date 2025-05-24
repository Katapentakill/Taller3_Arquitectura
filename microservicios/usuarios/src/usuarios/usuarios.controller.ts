import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsuariosService } from './usuarios.service';

@Controller()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @GrpcMethod('UsuariosService', 'CrearUsuario')
  crearUsuario(data: any) {
    return this.usuariosService.crearUsuario(data);
  }

  @GrpcMethod('UsuariosService', 'ObtenerUsuarioPorId')
  obtenerUsuarioPorId(data: { id: string; token: string }) {
    return this.usuariosService.obtenerUsuarioPorId(data.id, data.token);
  }

  @GrpcMethod('UsuariosService', 'ListarUsuarios')
  listarUsuarios(data: { token: string }) {
    return this.usuariosService.listarUsuarios(data.token);
  }

  @GrpcMethod('UsuariosService', 'EliminarUsuario')
  eliminarUsuario(data: { id: string; token: string }) {
    return this.usuariosService.eliminarUsuario(data.id, data.token);
  }
}
