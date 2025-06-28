import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { UsuariosService } from './usuarios.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @MessagePattern('verificar.token.y.rol')
  async verificarTokenYRol(@Payload() data: { token: string }) {
    return this.usuariosService.verificarTokenYRol(data.token);
  }

  @MessagePattern('obtener.usuarios')
  async manejarSolicitudUsuarios() {
    return this.usuariosService.obtenerTodosSinToken();
  }

  @GrpcMethod('UsuariosService', 'SeedUsuarios')
  async seedUsuarios(_: any) {
    return this.usuariosService.seedUsuarios();
  }



  
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

@GrpcMethod('UsuariosService', 'ActualizarUsuario')
actualizarUsuario(data: { id: string; nombre: string; apellido: string; correo: string; token: string }) {
  return this.usuariosService.actualizarUsuario(data);
}
@GrpcMethod('UsuariosService', 'HealthCheck')
healthCheck(_: any) {
  return { mensaje: '✅ Microservicio de usuarios operativo' };
}
}