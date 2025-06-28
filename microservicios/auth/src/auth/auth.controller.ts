import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  Req,
  UnauthorizedException,
  HttpCode,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @EventPattern('usuario.registro')
  async handleUsuarioRegistro(@Payload() data: any) {
    try {
      await this.authService.registrarUsuario(data.correo, data.password);
    } catch (err) {
      console.error('[Auth] ❌ Error al registrar usuario:', err);
    }
  }

  @MessagePattern('verificar.token')
  async handleVerificarToken(@Payload() data: { token: string }) {
    return this.authService.verificarToken(data.token);
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() data: { correo: string; password: string }) {
    return this.authService.login(data.correo, data.password);
  }

  @Post('auth/logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token requerido');
    return this.authService.logout(token);
  }

  @Patch('auth/usuarios/:id')
  async actualizarPassword(
    @Param('id') id: string,
    @Body() body,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    const payload = await this.authService.verificarToken(token);

    if (String(payload.sub) !== String(id)) {
      throw new UnauthorizedException('No autorizado para cambiar esta contraseña');
    }

    await this.authService.actualizarPassword(
      id,
      body.passwordActual,
      body.nuevaPassword,
      body.confirmarPassword,
    );

    return { message: 'Contraseña actualizada correctamente' };
  }

  @Get('auth/health')
  @HttpCode(200)
  getHealth() {
    return {
      status: 'ok',
      message: '✅ Auth microservice is running',
      timestamp: new Date().toISOString(),
    };
  }
}