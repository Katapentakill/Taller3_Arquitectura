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
}

@Controller('facturas')
export class FacturasController {
  private facturaService: FacturaService;

  constructor(@Inject('FACTURAS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.facturaService = this.client.getService<FacturaService>('FacturasService');
  }

  @Post()
  async crear(@Req() req: Request, @Body() body: any) {
    const token = this.obtenerToken(req);
    const data = { ...body, token };
    return await firstValueFrom(this.facturaService.CrearFactura(data));
  }

  @Post('seed')
  async seedFacturas() {
    return await firstValueFrom(this.facturaService.SeedFacturas({}));
  }


  @Get(':id')
  async obtenerPorId(@Param('id') id: string, @Req() req: Request) {
    const token = this.obtenerToken(req);
    return await firstValueFrom(this.facturaService.ObtenerFacturaPorId({ id, token }));
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const token = this.obtenerToken(req);
    return await firstValueFrom(
      this.facturaService.ActualizarFactura({ id, estado: body.estado, token }),
    );
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Req() req: Request) {
    const token = this.obtenerToken(req);
    return await firstValueFrom(this.facturaService.EliminarFactura({ id, token }));
  }

  @Get()
  async listar(@Req() req: Request, @Query('estado') estado?: string) {
    const token = this.obtenerToken(req);
    return await firstValueFrom(this.facturaService.ListarFacturas({ token, estado }));
  }

  private obtenerToken(req: Request): string {
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException('Token no proporcionado');
    return auth.split(' ')[1];
  }
}
