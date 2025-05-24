import { Controller, Post, Body, Inject, HttpCode, Patch, Param, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface LoginRequest {
  correo: string;
  password: string;
}

interface ActualizarPasswordRequest {
  id: string;
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
  token: string;
}

interface AuthService {
  login(data: LoginRequest);
  actualizarPassword(data: ActualizarPasswordRequest);
  registrarUsuario(data: { correo: string; password: string }): any;
  logout(data: { token: string }): any; // ✅ NUEVO
}

@Controller('auth')
export class AuthController {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginRequest) {
    console.log('[API Gateway] → POST /auth/login');
    const result = await firstValueFrom(this.authService.login(data));
    return result; // ✅ Esto retorna el access_token como JSON
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new Error('Token no proporcionado');

    console.log('[API Gateway] → POST /auth/logout');
    return await firstValueFrom(this.authService.logout({ token }));
  }


  @Patch('usuarios/:id')
  actualizarPassword(@Param('id') id: string, @Body() body, @Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    return this.authService.actualizarPassword({
      id,
      passwordActual: body.passwordActual,
      nuevaPassword: body.nuevaPassword,
      confirmarPassword: body.confirmarPassword,
      token,
    });
  }
}