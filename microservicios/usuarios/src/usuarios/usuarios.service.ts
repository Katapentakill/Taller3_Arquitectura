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
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';

interface CrearUsuarioDto {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmarPassword: string;
  rol: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async crearUsuario(data: CrearUsuarioDto) {
    const usuario = this.repo.create({
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      rol: data.rol,
    });

    const saved = await this.repo.save(usuario);

    this.rabbitMQClient.emit('usuario.registro', {
      correo: data.correo,
      password: data.password,
    });

    return saved;
  }
  async obtenerTodosSinToken() {
    const usuarios = await this.repo.find({ where: { softDelete: false } });
    return usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      rol: u.rol,
    }));
  }


  async verificarTokenYRol(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    // Llamar a Auth para verificar el token
    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const usuario = await this.repo.findOne({
      where: { correo: payload.correo, softDelete: false },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    return {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
  }

  async seedUsuarios() {
    const cantidad = Math.floor(Math.random() * 101) + 100; // entre 100 y 200
    const mitad = Math.floor(cantidad / 2);
    const usuarios: CrearUsuarioDto[] = [];

    // ✅ Usuario administrador por defecto
    usuarios.push({
      nombre: 'Admin',
      apellido: 'Debug',
      correo: 'admin@test.com',
      password: 'devpass',
      confirmarPassword: 'devpass',
      rol: 'Administrador',
    });

    // ✅ Usuario cliente por defecto
    usuarios.push({
      nombre: 'Cliente',
      apellido: 'Debug',
      correo: 'cliente@test.com',
      password: 'devpass',
      confirmarPassword: 'devpass',
      rol: 'Cliente',
    });

    // 🔁 Generar usuarios aleatorios
    for (let i = 0; i < cantidad; i++) {
      const nombre = faker.person.firstName();
      const apellido = faker.person.lastName();
      const correo = `usuario${randomUUID().slice(0, 8)}@test.com`;
      const rol = i < mitad ? 'Administrador' : 'Cliente';

      usuarios.push({
        nombre,
        apellido,
        correo,
        password: '123',
        confirmarPassword: '123',
        rol,
      });
    }

    for (const u of usuarios) {
      try {
        await this.crearUsuario(u);
      } catch (e) {
        console.error('❌ Error creando usuario:', u.correo);
      }
    }

    return {
      mensaje: `✅ Se crearon ${usuarios.length} usuarios, incluyendo admin@test.com y cliente@test.com con clave devpass.`,
    };
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
  try {
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

    return {}; // Vacío como espera gRPC
  } catch (error) {
    console.error('❌ Error en eliminarUsuario:', error);
    throw error;
  }
}

  async actualizarUsuario(data: any) {
    const { id, token, nombre, apellido, correo } = data;

    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.rabbitMQClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const solicitante = await this.repo.findOne({ where: { correo: payload.correo, softDelete: false } });
    if (!solicitante) throw new UnauthorizedException('No autorizado');

    if (solicitante.id !== id && solicitante.rol !== 'Administrador') {
      throw new ForbiddenException('No tienes permisos para modificar a este usuario');
    }

    const usuario = await this.repo.findOne({ where: { id, softDelete: false } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if ('password' in data || 'confirmarPassword' in data) {
      throw new ForbiddenException('La contraseña no se puede modificar aquí');
    }

    usuario.nombre = nombre;
    usuario.apellido = apellido;
    usuario.correo = correo;

    const actualizado = await this.repo.save(usuario);

    return {
      id: actualizado.id,
      nombre: actualizado.nombre,
      apellido: actualizado.apellido,
      correo: actualizado.correo,
      rol: actualizado.rol,
      fechaRegistro: actualizado.fechaRegistro?.toISOString() || '',
    };
  }
}
