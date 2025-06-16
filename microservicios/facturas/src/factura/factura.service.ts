import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../entity/factura.entity';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitMQClient: ClientProxy,
    @Inject('VIDEOS_RMQ')
    private readonly videosClient: ClientProxy,
  ) {}

  validarEstado(estado: string) {
    const validos = ['Pendiente', 'Pagado', 'Vencido'];
    if (!validos.includes(estado)) {
      throw new BadRequestException('Estado inválido');
    }
  }

  async seedFacturas() {
    // Sin cambios, esta función no requiere validación de token
    const usuariosResponse = await lastValueFrom(
      this.rabbitMQClient.send('obtener.usuarios', {}),
    ).catch(() => {
      throw new Error('No se pudieron obtener los usuarios');
    });

    const usuarios: { id: string }[] = usuariosResponse;
    if (!usuarios.length) throw new Error('No hay usuarios');

    const videosResponse = await lastValueFrom(
      this.videosClient.send('obtener.videos', {}),
    ).catch(() => {
      throw new Error('No se pudieron obtener los videos');
    });

    const videos: { id: string; titulo: string; precio: number }[] = videosResponse;
    if (!videos.length) throw new Error('No hay videos');

    const estados: ('Pendiente' | 'Pagado' | 'Vencido')[] = ['Pendiente', 'Pagado', 'Vencido'];
    const metodos: string[] = ['Tarjeta', 'Transferencia', 'Efectivo'];
    const cantidad = Math.floor(Math.random() * 101) + 300;

    const facturas: Partial<Factura>[] = [];

    for (let i = 0; i < cantidad; i++) {
      const user = usuarios[Math.floor(Math.random() * usuarios.length)];

      const videosComprados = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
        const video = videos[Math.floor(Math.random() * videos.length)];
        return {
          videoId: video.id,
          titulo: video.titulo,
          precio: video.precio,
        };
      });

      const total = videosComprados.reduce((sum, v) => sum + v.precio, 0);
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const metodoPago = metodos[Math.floor(Math.random() * metodos.length)];

      facturas.push({
        usuarioId: user.id,
        estado,
        metodoPago,
        total,
        videosComprados,
        fechaEmision: new Date(),
        fechaPago: estado === 'Pagado' ? new Date() : null,
        eliminado: false,
      });
    }

    await this.facturaRepo.save(this.facturaRepo.create(facturas));
    return { mensaje: `✅ Se generaron ${facturas.length} facturas aleatorias` };
  }

  async crear(data: any) {
    const payload = await this.verificarTokenYRol(data.token);

    if (payload.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden crear facturas');
    }

    if (!Number.isInteger(data.total) || data.total <= 0) {
      throw new BadRequestException('El monto debe ser un número entero positivo');
    }

    this.validarEstado(data.estado);

    const factura = new Factura();
    factura.usuarioId = data.usuarioId;
    factura.estado = data.estado;
    factura.metodoPago = data.metodoPago;
    factura.total = data.total;
    factura.videosComprados = data.videosComprados;
    factura.fechaEmision = new Date();
    factura.fechaPago = null;
    factura.eliminado = false;

    return await this.facturaRepo.save(factura);
  }

  async obtenerPorId(data: { id: string; token: string }) {
    const payload = await this.verificarTokenYRol(data.token);

    const factura = await this.facturaRepo.findOneBy({ id: data.id, eliminado: false });
    if (!factura) throw new NotFoundException('Factura no encontrada');

    if (payload.rol !== 'Administrador' && factura.usuarioId !== payload.id) {
      throw new ForbiddenException('No tiene permiso para ver esta factura');
    }

    return factura;
  }

  async actualizar(data: { id: string; estado: string; token: string }) {
    const payload = await this.verificarTokenYRol(data.token);

    if (payload.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden actualizar facturas');
    }

    this.validarEstado(data.estado);

    const factura = await this.facturaRepo.findOneBy({ id: data.id, eliminado: false });
    if (!factura) throw new NotFoundException('Factura no encontrada');

    factura.estado = data.estado as 'Pendiente' | 'Pagado' | 'Vencido';
    if (data.estado === 'Pagado') {
      factura.fechaPago = new Date();
    }

    return await this.facturaRepo.save(factura);
  }

  async eliminar(data: { id: string; token: string }) {
    const payload = await this.verificarTokenYRol(data.token);

    if (payload.rol !== 'Administrador') {
      throw new ForbiddenException('Solo administradores pueden eliminar facturas');
    }

    const factura = await this.facturaRepo.findOneBy({ id: data.id, eliminado: false });
    if (!factura) throw new NotFoundException('Factura no encontrada');

    if (factura.estado === 'Pagado') {
      throw new BadRequestException('No se puede eliminar una factura pagada');
    }

    factura.eliminado = true;
    return await this.facturaRepo.save(factura);
  }

  async obtenerTodas(data: { token: string; estado?: string }) {
    const payload = await this.verificarTokenYRol(data.token);

    const where: any = { eliminado: false };

    if (payload.rol !== 'Administrador') {
      where.usuarioId = payload.id;
    }

    if (data.estado) {
      this.validarEstado(data.estado);
      where.estado = data.estado;
    }

    return await this.facturaRepo.find({ where });
  }

  private async verificarTokenYRol(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    return await lastValueFrom(
      this.rabbitMQClient.send('verificar.token.y.rol', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });
  }
}
