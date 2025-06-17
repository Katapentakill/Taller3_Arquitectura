import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ✅ NUEVO ENDPOINT para probar el balanceo
  @Get('ping')
  getPing() {
    return {
      puerto: process.env.PORT,
    };
  }
}