import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';


interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface FacturaService {
  CrearFactura(data: any): any;
  ObtenerFacturaPorId(data: any): any;
  ActualizarFactura(data: any): any;
  EliminarFactura(data: any): any;
  ListarFacturas(data: any): any;
  SeedFacturas(data: any): any;
  HealthCheck(data: any): any;
}

@Controller('facturas')
export class FacturasController {
  private facturaService: FacturaService;

  constructor(@Inject('FACTURAS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.facturaService = this.client.getService<FacturaService>('FacturasService');
  }

  @Post('seed')
  async seedFacturas() {
    console.log('[Gateway] → POST /facturas/seed');
    return await firstValueFrom(this.facturaService.SeedFacturas({}));
  }

  @Get('health')
  @HttpCode(200)
  async healthCheck() {
    console.log('[Gateway] → GET /facturas/health');
    return await firstValueFrom(this.facturaService.HealthCheck({}));
  }

  @Post()
  async crear(@Req() req: Request, @Body() body: any) {
    const token = this.obtenerToken(req);
    const data = { ...body, token };
    console.log('[Gateway] → POST /facturas');
    return await firstValueFrom(this.facturaService.CrearFactura(data));
  }

  @Get()
  async listar(@Req() req: Request, @Query('estado') estado?: string) {
    const token = this.obtenerToken(req);
    console.log('[Gateway] → GET /facturas');
    return await firstValueFrom(this.facturaService.ListarFacturas({ token, estado }));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string, @Req() req: Request) {
    const token = this.obtenerToken(req);
    console.log(`[Gateway] → GET /facturas/${id}`);
    return await firstValueFrom(this.facturaService.ObtenerFacturaPorId({ id, token }));
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const token = this.obtenerToken(req);
    console.log(`[Gateway] → PATCH /facturas/${id}`);
    return await firstValueFrom(
      this.facturaService.ActualizarFactura({ id, estado: body.estado, token }),
    );
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Req() req: Request) {
    const token = this.obtenerToken(req);
    console.log(`[Gateway] → DELETE /facturas/${id}`);
    return await firstValueFrom(this.facturaService.EliminarFactura({ id, token }));
  }

  private obtenerToken(req: Request): string {
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException('Token no proporcionado');
    return auth.split(' ')[1];
  }
}
