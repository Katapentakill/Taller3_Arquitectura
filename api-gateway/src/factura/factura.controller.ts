import { Controller, Get, Post, Patch, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface Producto {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface FacturaInput {
  usuarioId: string;
  fechaEmision: string;
  metodoPago: string;
  total: number;
  productos: Producto[];
}

interface FacturaService {
  CrearFactura(data: FacturaInput): any;
  ObtenerFacturas(data: {}): any;
  ObtenerFacturaPorId(data: { id: string }): any;
  ActualizarFactura(data: { id: string; update: FacturaInput }): any;
  EliminarFactura(data: { id: string }): any;
}

@Controller('facturas')
export class FacturaController {
  private facturaService: FacturaService;

  constructor(@Inject('FACTURA_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.facturaService = this.client.getService<FacturaService>('FacturaService');
  }

  @Post()
  async crear(@Body() data: FacturaInput) {
    return await firstValueFrom(this.facturaService.CrearFactura(data));
  }

  @Get()
  async obtenerTodas() {
    return await firstValueFrom(this.facturaService.ObtenerFacturas({}));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await firstValueFrom(this.facturaService.ObtenerFacturaPorId({ id }));
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() update: FacturaInput) {
    return await firstValueFrom(this.facturaService.ActualizarFactura({ id, update }));
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await firstValueFrom(this.facturaService.EliminarFactura({ id }));
  }
}