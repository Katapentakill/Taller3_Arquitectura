import { Controller } from '@nestjs/common';
import { GrpcMethod, EventPattern } from '@nestjs/microservices';
import { MonitoreoService } from './monitoreo.service';

@Controller()
export class MonitoreoController {
  constructor(private readonly service: MonitoreoService) {}

  @GrpcMethod('MonitoreoService', 'ListarAcciones')
  listarAcciones(data: { token: string }) {
    return this.service.listarAcciones(data.token);
  }

  @GrpcMethod('MonitoreoService', 'ListarErrores')
  listarErrores(data: { token: string }) {
    return this.service.listarErrores(data.token);
  }

  @GrpcMethod('MonitoreoService', 'HealthCheck')
  healthCheck(_: any) {
    return { mensaje: '✅ Microservicio de monitoreo operativo' };
  }

  @EventPattern('accion.registrada')
  handleRegistrarAccion(data: any) {
    return this.service.registrarAccion(data);
  }

  @EventPattern('error.registrado')
  handleRegistrarError(data: any) {
    return this.service.registrarError(data);
  }
}