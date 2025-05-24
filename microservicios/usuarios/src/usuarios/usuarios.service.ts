import {
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Usuario } from 'src/Entity/usuario.entity';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async crearUsuario(data: any) {
    const usuario = this.repo.create(data);
    const saved = await this.repo.save(usuario);

    this.rabbitMQClient.emit('usuario.registro', {
      correo: data.correo,
      password: data.password,
    });

    return saved;
  }

  async obtenerUsuarioPorId(id: string, token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const correo = payload.correo;
    const solicitante = await this.repo.findOne({ where: { correo, softDelete: false } });
    if (!solicitante) throw new UnauthorizedException('No autorizado');

    const usuario = await this.repo.findOne({ where: { id, softDelete: false } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (solicitante.id !== usuario.id && solicitante.rol !== 'Administrador') {
      throw new ForbiddenException('Acceso denegado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
      fechaRegistro: usuario.fechaRegistro?.toISOString() || new Date().toISOString(),
    };
  }

  async listarUsuarios(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const solicitante = await this.repo.findOne({
      where: { correo: payload.correo, softDelete: false },
    });

    if (!solicitante || solicitante.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden listar usuarios');
    }

    const usuarios = await this.repo.find({ where: { softDelete: false } });

    return {
      usuarios: usuarios.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        rol: u.rol,
        fechaRegistro: u.fechaRegistro?.toISOString() || '',
      })),
    };
  }

  async eliminarUsuario(id: string, token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const solicitante = await this.repo.findOne({
      where: { correo: payload.correo, softDelete: false },
    });

    if (!solicitante || solicitante.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden eliminar usuarios');
    }

    const usuario = await this.repo.findOne({ where: { id, softDelete: false } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    usuario.softDelete = true;
    await this.repo.save(usuario);

    return {}; // Empty
  }
}