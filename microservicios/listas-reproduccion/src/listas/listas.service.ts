import {
  Injectable,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ListaReproduccion } from 'src/entities/lista-reproduccion.entity';
import { ListaVideo } from 'src/entities/lista-video.entity';

@Injectable()
export class ListasService {
  constructor(
    @InjectRepository(ListaReproduccion)
    private readonly listasRepo: Repository<ListaReproduccion>,
    @InjectRepository(ListaVideo)
    private readonly listaVideoRepo: Repository<ListaVideo>,

    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  async crearLista(nombre: string, token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    // Verificar token con microservicio de autenticación
    const payload = await lastValueFrom(
      this.authClient.send('verificar.token', { token }),
    ).catch((err) => {
      throw new UnauthorizedException('Token inválido');
    });

    const usuarioId = payload.sub;

    const nuevaLista = this.listasRepo.create({
      nombre,
      usuarioId,
    });

    const guardada = await this.listasRepo.save(nuevaLista);

    return {
      id: guardada.id,
      nombre: guardada.nombre,
      usuarioId: guardada.usuarioId,
      fechaCreacion: guardada.fechaCreacion.toISOString(),
    };
  }
  async eliminarLista(listaId: string, token: string) {
  if (!token) throw new UnauthorizedException('Token requerido');

  // Verificación del token con Auth
  const payload = await lastValueFrom(
    this.authClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const lista = await this.listasRepo.findOne({
    where: { id: listaId, softDelete: false },
  });

  if (!lista) {
    throw new NotFoundException('Lista no encontrada');
  }

  if (lista.usuarioId !== payload.sub) {
    throw new ForbiddenException('No tienes permiso para eliminar esta lista');
  }

  lista.softDelete = true;
  await this.listasRepo.save(lista);

  return {}; // gRPC espera objeto vacío
  }

  async obtenerListas(token: string) {
  if (!token) throw new UnauthorizedException('Token requerido');

  const payload = await lastValueFrom(
    this.authClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const usuarioId = payload.sub;

  const listas = await this.listasRepo.find({
    where: { usuarioId, softDelete: false },
    order: { fechaCreacion: 'DESC' },
  });

  return {
    listas: listas.map((lista) => ({
      id: lista.id,
      nombre: lista.nombre,
      usuarioId: lista.usuarioId,
      fechaCreacion: lista.fechaCreacion.toISOString(),
    })),
  };
  }

  async anadirVideo(listaId: string, videoId: string, token: string) {
  if (!token) throw new UnauthorizedException('Token requerido');

  const payload = await lastValueFrom(
    this.authClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const lista = await this.listasRepo.findOne({ where: { id: listaId, softDelete: false } });
  if (!lista) throw new NotFoundException('Lista no encontrada');

  if (lista.usuarioId !== payload.sub) throw new ForbiddenException('No autorizado');

  const nuevo = this.listaVideoRepo.create({ lista, videoId });
  await this.listaVideoRepo.save(nuevo);

  return {
    id: lista.id,
    nombre: lista.nombre,
    usuarioId: lista.usuarioId,
    fechaCreacion: lista.fechaCreacion.toISOString(),
  };
}

async eliminarVideo(listaId: string, videoId: string, token: string) {
  if (!token) throw new UnauthorizedException('Token requerido');

  const payload = await lastValueFrom(
    this.authClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const lista = await this.listasRepo.findOne({ where: { id: listaId, softDelete: false } });
  if (!lista) throw new NotFoundException('Lista no encontrada');

  if (lista.usuarioId !== payload.sub) throw new ForbiddenException('No autorizado');

  await this.listaVideoRepo.delete({ lista: { id: listaId }, videoId });

  return {
    id: lista.id,
    nombre: lista.nombre,
    usuarioId: lista.usuarioId,
    fechaCreacion: lista.fechaCreacion.toISOString(),
  };
}

async obtenerVideosLista(listaId: string, token: string) {
  if (!token) throw new UnauthorizedException('Token requerido');

  const payload = await lastValueFrom(
    this.authClient.send('verificar.token', { token }),
  ).catch(() => {
    throw new UnauthorizedException('Token inválido');
  });

  const lista = await this.listasRepo.findOne({ where: { id: listaId, softDelete: false } });
  if (!lista) throw new NotFoundException('Lista no encontrada');

  if (lista.usuarioId !== payload.sub) throw new ForbiddenException('No autorizado');

  const videos = await this.listaVideoRepo.find({
    where: { lista: { id: listaId } },
  });

  return {
    videoIds: videos.map((v) => v.videoId),
  };
}


}