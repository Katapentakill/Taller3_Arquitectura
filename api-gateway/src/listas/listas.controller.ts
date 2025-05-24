import {
  Controller,
  Post,
  Body,
  Inject,
  Req,
  UnauthorizedException,
  Delete,
  Param,
  HttpCode,
  Get,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CrearListaRequest {
  nombre: string;
  token: string;
}

interface EliminarListaRequest {
  listaId: string;
  token: string;
}

interface ListasService {
  crearLista(data: CrearListaRequest): any;
  eliminarLista(data: EliminarListaRequest): any;
  obtenerListas(data: { token: string }): any;
  anadirVideo(data: { listaId: string; videoId: string; token: string }): any;
  eliminarVideo(data: { listaId: string; videoId: string; token: string }): any;
  obtenerVideosLista(data: { listaId: string; token: string }): any;
}


@Controller('listas-reproduccion')
export class ListasController {
  private listasService: ListasService;

  constructor(@Inject('LISTAS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.listasService = this.client.getService<ListasService>('ListasReproduccionService');
  }

  @Post()
  async crearLista(@Body() body: { nombre: string }, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(
      this.listasService.crearLista({ nombre: body.nombre, token }),
    );
  }

  @Get()
  async obtenerListas(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(this.listasService.obtenerListas({ token }));
  }

  @Delete(':id')
  @HttpCode(204)
  async eliminarLista(@Param('id') listaId: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    await firstValueFrom(this.listasService.eliminarLista({ listaId, token }));
    return;
  }

  @Post(':id/videos')
  async anadirVideo(
    @Param('id') listaId: string,
    @Body() body: { videoId: string },
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(
      this.listasService.anadirVideo({ listaId, videoId: body.videoId, token }),
    );
  }

  @Delete(':id/videos')
  async eliminarVideo(
    @Param('id') listaId: string,
    @Body() body: { videoId: string },
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(
      this.listasService.eliminarVideo({ listaId, videoId: body.videoId, token }),
    );
  }

  @Get(':id/videos')
  async obtenerVideosLista(@Param('id') listaId: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(
      this.listasService.obtenerVideosLista({ listaId, token }),
    );
  }
}