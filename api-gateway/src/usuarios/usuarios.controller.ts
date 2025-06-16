import { Controller, Post, Body, Inject, Get, Param, Req, UnauthorizedException, Delete, Patch } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmarPassword: string;
  rol: string;
}

interface UsuariosService {
  seedUsuarios(data: {}): any;
  crearUsuario(data: Partial<CrearUsuarioRequest>): any;
  obtenerUsuarioPorId(data: { id: string; token: string }): any;
  listarUsuarios(data: { token: string }): any;
  eliminarUsuario(data: { id: string; token: string }): any;
  actualizarUsuario(data: { id: string; token: string; nombre: string; apellido: string; correo: string }): any;
}

@Controller('usuarios')
export class UsuariosController {
  private usuariosService: UsuariosService;

  constructor(@Inject('USUARIOS_PACKAGE') private usuariosClient: ClientGrpc) {}

  onModuleInit() {
    this.usuariosService = this.usuariosClient.getService<UsuariosService>('UsuariosService');
  }


  @Post('seed')
  async seedUsuarios() {
    return firstValueFrom(this.usuariosService.seedUsuarios({}));
  }


  @Post()
  async crearUsuario(@Body() data: CrearUsuarioRequest, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    let token: string | undefined = undefined;
    if (data.rol === 'Administrador') {
      if (!authHeader) {
        throw new UnauthorizedException('Token requerido para crear administradores');
      }
      token = authHeader.split(' ')[1];
    }

    const usuarioCompleto = {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      confirmarPassword: data.confirmarPassword,
      rol: data.rol,
      token,
    };

    try {
      return await firstValueFrom(this.usuariosService.crearUsuario(usuarioCompleto));
    } catch (error) {
      throw error;
    }
  }


  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: string, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];

    try {
      const usuario = await firstValueFrom(
        this.usuariosService.obtenerUsuarioPorId({ id, token }),
      );
      return usuario;
    } catch (error) {
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

  @Patch(':id')
  async actualizarUsuario(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];

    const data = {
      id,
      token,
      nombre: body.nombre,
      apellido: body.apellido,
      correo: body.correo,
    };

    try {
      const usuario = await firstValueFrom(this.usuariosService.actualizarUsuario(data));
      return usuario;
    } catch (error) {
      throw error;
    }
  }
}
