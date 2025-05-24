import { Controller, UnauthorizedException } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext, GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @EventPattern('usuario.registro')
  async handleUsuarioRegistro(@Payload() data: any) {
    try {
      console.log('[Auth] ← Evento usuario.registro recibido:', data);
      await this.authService.registrarUsuario(data.correo, data.password);
      console.log('[Auth] → Usuario creado en Auth DB');
    } catch (err) {
      console.error('[Auth] ❌ Error al registrar usuario:', err);
    }
  }

  @MessagePattern('verificar.token')
  async handleVerificarToken(@Payload() data: { token: string }) {
    const payload = await this.authService.verificarToken(data.token);
    return payload;
  }


  @GrpcMethod('AuthService', 'Login')
  async loginGrpc(data: { correo: string; password: string }) {
    console.log('[Auth] ← gRPC Login recibido');
    const token = await this.authService.login(data.correo, data.password);
    return { token: token };
  }

  @GrpcMethod('AuthService', 'Logout')
  async logoutGrpc(data: { token: string }) {
    return this.authService.logout(data.token);
  }

  @GrpcMethod('AuthService', 'ActualizarPassword')
  async actualizarPasswordUsuarioGrpc(data: {
    id: string;
    passwordActual: string;
    nuevaPassword: string;
    confirmarPassword: string;
    token: string;
  }) {
    try {
      const payload = await this.authService.verificarToken(data.token);
      if (String(payload.sub) !== String(data.id)) {
        throw new UnauthorizedException('No autorizado para cambiar esta contraseña');
      }

      await this.authService.actualizarPassword(
        data.id,
        data.passwordActual,
        data.nuevaPassword,
        data.confirmarPassword,
      );

      return { message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      console.error('[Auth] ❌ Error en actualizarPassword:', err);
      throw err;
    }
  }
}