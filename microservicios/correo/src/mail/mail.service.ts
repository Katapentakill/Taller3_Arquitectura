import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async enviarFactura(data: any) {
    const { correo, nombre, total, fecha, detalle } = data;

    const items = detalle.map(
      (item) => `• ${item.nombre} - $${item.precio}`,
    ).join('\n');

    const message = `
Hola ${nombre},

Gracias por tu compra. Aquí está el resumen de tu factura del ${fecha}:

${items}

Total: $${total}

Atentamente,
El equipo de StreamingApp`;

    try {
      await this.transporter.sendMail({
        from: `"StreamingApp" <${process.env.MAIL_USER}>`,
        to: correo,
        subject: 'Tu factura ha sido generada',
        text: message,
      });

      this.logger.log(`Correo enviado a ${correo}`);
    } catch (err) {
      this.logger.error('Error al enviar correo:', err.message);
    }
  }
}