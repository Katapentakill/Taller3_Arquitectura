import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FacturaService } from './factura.service';

@Controller()
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @GrpcMethod('FacturasService', 'CrearFactura')
  crear(data: any) {
    return this.facturaService.crear(data);
  }
  
  @GrpcMethod('FacturasService', 'SeedFacturas')
  seedFacturas(_: any) {
    return this.facturaService.seedFacturas();
  }


  @GrpcMethod('FacturasService', 'ObtenerFacturaPorId')
  obtenerPorId(data: { id: string; token: string }) {
    return this.facturaService.obtenerPorId(data);
  }

  @GrpcMethod('FacturasService', 'ActualizarFactura')
  actualizar(data: { id: string; estado: string; token: string }) {
    return this.facturaService.actualizar(data);
  }

  @GrpcMethod('FacturasService', 'EliminarFactura')
  eliminar(data: { id: string; token: string }) {
    return this.facturaService.eliminar(data);
  }

  @GrpcMethod('FacturasService', 'ListarFacturas')
  obtenerTodas(data: { token: string; estado?: string }) {
    return this.facturaService.obtenerTodas(data);
  }
}