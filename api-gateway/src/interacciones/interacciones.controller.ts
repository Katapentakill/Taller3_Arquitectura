import { Controller, Post, Get, Body, Param, Inject, UnauthorizedException, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface InteraccionesService {
  seedInteracciones(data: {}): any;
  darLike(data: { videoId: string; token: string }): any;
  dejarComentario(data: { videoId: string; content: string; token: string }): any;
  obtenerInteracciones(data: { videoId: string; token: string }): any;
}

@Controller('interacciones')
export class InteraccionesController {
  private interaccionesService: InteraccionesService;

  constructor(@Inject('INTERACCIONES_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.interaccionesService = this.client.getService<InteraccionesService>('InteraccionesService');
  }

  @Post('like')
  async darLike(@Body() body: { videoId: string; token: string }) {
    return await firstValueFrom(this.interaccionesService.darLike(body));
  }

  @Post('comentario')
  async dejarComentario(@Body() body: { videoId: string; content: string; token: string }) {
    return await firstValueFrom(this.interaccionesService.dejarComentario(body));
  }

  @Post('seed')
  async seedInteracciones() {
    return await firstValueFrom(this.interaccionesService.seedInteracciones({}));
  }


  @Get(':videoId')
  async obtenerInteracciones(@Param('videoId') videoId: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    return await firstValueFrom(this.interaccionesService.obtenerInteracciones({ videoId, token }));
  }
}