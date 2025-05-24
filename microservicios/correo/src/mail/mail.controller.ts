import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('factura.creada')
  async handleFacturaCreada(@Payload() data: any) {
    console.log('[Correo] 📩 Evento factura.creada recibido');
    await this.mailService.enviarFactura(data);
  }

  @EventPattern('factura.actualizada')
  async handleFacturaActualizada(@Payload() data: any) {
    console.log('[Correo] 📩 Evento factura.actualizada recibido');
    await this.mailService.enviarFactura(data);
  }
}