import { Controller } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @GrpcMethod('FacturaService', 'CrearFactura')
  crear(data: any) {
    return this.facturaService.crear(data);
  }

  @GrpcMethod('FacturaService', 'ObtenerFacturas')
  obtenerTodas() {
    return this.facturaService.obtenerTodas();
  }

  @GrpcMethod('FacturaService', 'ObtenerFacturaPorId')
  obtenerPorId(data: { id: string }) {
    return this.facturaService.obtenerPorId(data.id);
  }

  @GrpcMethod('FacturaService', 'ActualizarFactura')
  actualizar(data: { id: string; update: any }) {
    return this.facturaService.actualizar(data.id, data.update);
  }

  @GrpcMethod('FacturaService', 'EliminarFactura')
  eliminar(data: { id: string }) {
    return this.facturaService.eliminar(data.id);
  }
}