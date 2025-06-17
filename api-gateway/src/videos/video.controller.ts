import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
  Req,
  UnauthorizedException,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

// Interfaces específicas del Gateway de Videos

interface CrearVideoRequest {
  title: string;
  description: string;
  genre: string;
  price: number;
}

interface ActualizarVideoRequest {
  title?: string;
  description?: string;
  genre?: string;
  price?: number;
}


interface ObtenerVideoRequest {
  id: string;
  token: string;
}

interface BuscarPorTituloRequest {
  titulo: string;
  token: string;
}

interface VideosService {
  crearVideo(data: CrearVideoRequest & { token: string }): any;
  obtenerVideoPorId(data: ObtenerVideoRequest): any;
  listarVideos(data: { token: string }): any;
  eliminarVideo(data: { id: string; token: string }): any;
  actualizarVideo(data: { id: string } & ActualizarVideoRequest & { token: string }): any;
  buscarVideosPorTitulo(data: BuscarPorTituloRequest): any;
  seedVideos(data: {}): any;
}

@Controller('videos')
export class VideoController {
  private videoService: VideosService;

  constructor(@Inject('VIDEOS_PACKAGE') private readonly videoClient: ClientGrpc) {}

  onModuleInit() {
    this.videoService = this.videoClient.getService<VideosService>('VideosService');
  }
  
  @Post('seed')
  async seedVideos() {
    console.log('[Gateway] → POST /videos/seed');
    return await firstValueFrom(this.videoService.seedVideos({}));
  }


  @Post()
  async crearVideo(@Body() data: CrearVideoRequest, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log('[Gateway] → POST /videos');
    const video = await firstValueFrom(
      this.videoService.crearVideo({ ...data, token }),
    );
    return video;
  }

  @Get(':id')
  async obtenerVideoPorId(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → GET /videos/${id}`);
    const video = await firstValueFrom(
      this.videoService.obtenerVideoPorId({ id, token }),
    );
    return video;
  }

  @Get()
  async listarVideos(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log('[Gateway] → GET /videos');
    const lista = await firstValueFrom(
      this.videoService.listarVideos({ token }),
    );
    return lista;
  }

  @Delete(':id')
  async eliminarVideo(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → DELETE /videos/${id}`);
    const result = await firstValueFrom(
      this.videoService.eliminarVideo({ id, token }),
    );
    return result;
  }

  @Patch(':id')
  async actualizarVideo(
    @Param('id') id: string,
    @Body() data: ActualizarVideoRequest,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → PATCH /videos/${id}`);
    const actualizado = await firstValueFrom(
      this.videoService.actualizarVideo({
        id,
        ...data,
        token,
      }),
    );
    return actualizado;
  }

  @Get('/buscar/titulo')
  async buscarPorTitulo(@Query('titulo') titulo: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log('[Gateway] → GET /videos/buscar/titulo');
    const resultado = await firstValueFrom(
      this.videoService.buscarVideosPorTitulo({ titulo, token }),
    );
    return resultado;
  }
}