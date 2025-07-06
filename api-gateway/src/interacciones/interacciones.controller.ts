import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Inject,
  UnauthorizedException,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

interface InteraccionesService {
  seedInteracciones(data: {}): any;
  darLike(data: { videoId: string; token: string }): any;
  dejarComentario(data: { videoId: string; content: string; token: string }): any;
  obtenerInteracciones(data: { videoId: string; token: string }): any;
  healthCheck(data: {}): any;
}

@Controller('interacciones')
export class InteraccionesController {
  private interaccionesService: InteraccionesService;

  constructor(@Inject('INTERACCIONES_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.interaccionesService = this.client.getService<InteraccionesService>('InteraccionesService');
  }

  @Post('seed')
  async seedInteracciones() {
    console.log('[Gateway] → POST /interacciones/seed');
    return await firstValueFrom(this.interaccionesService.seedInteracciones({}));
  }

  @Get('health')
  @HttpCode(200)
  async healthCheck() {
    console.log('[Gateway] → GET /interacciones/health');
    return await firstValueFrom(this.interaccionesService.healthCheck({}));
  }

  @Post(':videoId/like')
  async darLike(@Param('videoId') videoId: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → POST /interacciones/${videoId}/like`);
    return await firstValueFrom(this.interaccionesService.darLike({ videoId, token }));
  }

  @Post(':videoId/comentario')
  async dejarComentario(
    @Param('videoId') videoId: string,
    @Body() body: { content: string },
    @Req() req: Request
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → POST /interacciones/${videoId}/comentario`);
    return await firstValueFrom(
      this.interaccionesService.dejarComentario({ videoId, content: body.content, token })
    );
  }

  @Get(':videoId')
  async obtenerInteracciones(@Param('videoId') videoId: string, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log(`[Gateway] → GET /interacciones/${videoId}`);
    return await firstValueFrom(this.interaccionesService.obtenerInteracciones({ videoId, token }));
  }
}