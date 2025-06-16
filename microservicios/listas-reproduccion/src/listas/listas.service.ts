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

    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('VIDEOS_RMQ') private readonly videosClient: ClientProxy,
    @Inject('USUARIOS_SERVICE') private readonly usuariosClient: ClientProxy,
  ) {}

  private async verificarTokenYRol(token: string): Promise<{ id: string; rol: string }> {
    const payload = await lastValueFrom(
      this.authClient.send('verificar.token', { token }),
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    const usuario = await lastValueFrom(
      this.usuariosClient.send('obtener.usuario', { id: payload.sub, token }),
    ).catch(() => {
      throw new UnauthorizedException('Usuario no válido o sin permisos');
    });

    return usuario;
  }

  async crearLista(nombre: string, token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const { id: usuarioId } = await this.verificarTokenYRol(token);

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

    const { id: usuarioId } = await this.verificarTokenYRol(token);

    const lista = await this.listasRepo.findOne({
      where: { id: listaId, softDelete: false },
    });

    if (!lista) throw new NotFoundException('Lista no encontrada');

    if (lista.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta lista');
    }

    lista.softDelete = true;
    await this.listasRepo.save(lista);

    return {}; // gRPC espera objeto vacío
  }

  async obtenerListas(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const { id: usuarioId } = await this.verificarTokenYRol(token);

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

    const { id: usuarioId } = await this.verificarTokenYRol(token);

    const lista = await this.listasRepo.findOne({
      where: { id: listaId, softDelete: false },
    });
    if (!lista) throw new NotFoundException('Lista no encontrada');

    if (lista.usuarioId !== usuarioId) {
      throw new ForbiddenException('No autorizado');
    }

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

    const { id: usuarioId } = await this.verificarTokenYRol(token);

    const lista = await this.listasRepo.findOne({
      where: { id: listaId, softDelete: false },
    });
    if (!lista) throw new NotFoundException('Lista no encontrada');

    if (lista.usuarioId !== usuarioId) {
      throw new ForbiddenException('No autorizado');
    }

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

    const { id: usuarioId } = await this.verificarTokenYRol(token);

    const lista = await this.listasRepo.findOne({
      where: { id: listaId, softDelete: false },
    });
    if (!lista) throw new NotFoundException('Lista no encontrada');

    if (lista.usuarioId !== usuarioId) {
      throw new ForbiddenException('No autorizado');
    }

    const relaciones = await this.listaVideoRepo.find({
      where: { lista: { id: listaId } },
    });

    const resultados: any[] = [];

    for (const relacion of relaciones) {
      try {
        const video = await lastValueFrom(
          this.videosClient.send('obtener.video.por.id', {
            id: relacion.videoId,
          }),
        );
        resultados.push(video);
      } catch (e) {
        // Video no disponible
      }
    }

    return { videos: resultados };
  }
}