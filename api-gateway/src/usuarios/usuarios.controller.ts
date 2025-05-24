import { Controller, Post, Body, Inject, Get, Param, Req, UnauthorizedException, Delete } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmarPassword: string;
  rol: string;
}

interface ObtenerUsuarioRequest {
  id: string;
  token: string;
}

interface UsuariosService {
  crearUsuario(data: Partial<CrearUsuarioRequest>): any;
  obtenerUsuarioPorId(data: ObtenerUsuarioRequest): any;
  listarUsuarios(data: { token: string }): any;
  eliminarUsuario(data: { id: string; token: string }): any;
}

@Controller('usuarios')
export class UsuariosController {
  private usuariosService: UsuariosService;

  constructor(@Inject('USUARIOS_PACKAGE') private usuariosClient: ClientGrpc) {}

  onModuleInit() {
    this.usuariosService = this.usuariosClient.getService<UsuariosService>('UsuariosService');
  }

  @Post()
  async crearUsuario(@Body() data: CrearUsuarioRequest) {
    console.log('[Gateway] → POST /usuarios');
    const usuarioCompleto = {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      confirmarPassword: data.confirmarPassword,
      rol: data.rol,
    };

    try {
      const usuarioCreado = await firstValueFrom(
        this.usuariosService.crearUsuario(usuarioCompleto),
      );
      return usuarioCreado;
    } catch (error) {
      console.error('[Gateway] ❌ Error al crear usuario:', error);
      throw error;
    }
  }

  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: string, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      const usuario = await firstValueFrom(
        this.usuariosService.obtenerUsuarioPorId({ id, token }),
      );
      return usuario;
    } catch (error) {
      console.error('[Gateway] ❌ Error al obtener usuario:', error);
      throw error;
    }
  }

  @Get()
  async listarUsuarios(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];
    return firstValueFrom(this.usuariosService.listarUsuarios({ token }));
  }

  @Delete(':id')
  async eliminarUsuario(@Param('id') id: string, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];
    return firstValueFrom(this.usuariosService.eliminarUsuario({ id, token }));
  }

}