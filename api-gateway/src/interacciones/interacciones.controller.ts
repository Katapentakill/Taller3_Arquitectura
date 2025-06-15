import { Controller, Post, Get, Body, Param, Inject, Req, HttpCode } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface InteraccionService {
  crearComentario(data: { videoId: string; usuarioId: string; texto: string }): any;
  obtenerComentarios(data: { videoId: string }): any;
  darLike(data: { videoId: string; usuarioId: string }): any;
  quitarLike(data: { videoId: string; usuarioId: string }): any;
  contarLikes(data: { videoId: string }): any;
}

@Controller('interacciones')
export class InteraccionesController {
  private interaccionService: InteraccionService;

  constructor(@Inject('INTERACCIONES_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.interaccionService = this.client.getService<InteraccionService>('InteraccionService');
  }

  @Post('comentario')
  async crearComentario(@Body() body: { videoId: string; usuarioId: string; texto: string }) {
    return await firstValueFrom(this.interaccionService.crearComentario(body));
  }

  @Get('comentarios/:videoId')
  async obtenerComentarios(@Param('videoId') videoId: string) {
    return await firstValueFrom(this.interaccionService.obtenerComentarios({ videoId }));
  }

  @Post('like')
  async darLike(@Body() body: { videoId: string; usuarioId: string }) {
    return await firstValueFrom(this.interaccionService.darLike(body));
  }

  @Post('like/quitar')
  async quitarLike(@Body() body: { videoId: string; usuarioId: string }) {
    return await firstValueFrom(this.interaccionService.quitarLike(body));
  }

  @Get('like/total/:videoId')
  async contarLikes(@Param('videoId') videoId: string) {
    return await firstValueFrom(this.interaccionService.contarLikes({ videoId }));
  }
}