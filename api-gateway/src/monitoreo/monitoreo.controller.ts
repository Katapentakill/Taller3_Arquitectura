import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface MonitoreoService {
  listarAcciones(data: { token: string }): any;
  listarErrores(data: { token: string }): any;
  healthCheck(data: {}): any; // ✅ NUEVO
}

@Controller('monitoreo')
export class MonitoreoController {
  private monitoreoService: MonitoreoService;

  constructor(@Inject('MONITOREO_PACKAGE') private readonly monitoreoClient: ClientGrpc) {}

  onModuleInit() {
    this.monitoreoService = this.monitoreoClient.getService<MonitoreoService>('MonitoreoService');
  }

  @Get('estado/health')
    async healthCheck() {
      return await firstValueFrom(this.monitoreoService.healthCheck({}));
  }

  @Get('acciones')
  async listarAcciones(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log('[Gateway] → GET /monitoreo/acciones');
    return await firstValueFrom(
      this.monitoreoService.listarAcciones({ token }),
    );
  }

  @Get('errores')
  async listarErrores(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    console.log('[Gateway] → GET /monitoreo/errores');
    return await firstValueFrom(
      this.monitoreoService.listarErrores({ token }),
    );
  }
}