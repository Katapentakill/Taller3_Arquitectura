import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Req,
  HttpCode,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject(HttpService) private readonly http: HttpService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() data: { correo: string; password: string }) {
    const response = await lastValueFrom(
      this.http.post('http://localhost:3002/auth/login', data),
    ) as { data: any };
    return response.data;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token requerido');

    const response = await lastValueFrom(
      this.http.post(
        'http://localhost:3002/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );
    return response.data;
  }

  @Patch('usuarios/:id')
  async actualizarPassword(
    @Param('id') id: string,
    @Body() body,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token requerido');

    const response = await lastValueFrom(
      this.http.patch(
        `http://localhost:3002/auth/usuarios/${id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    ) as { data: any };
    return (response as { data: any }).data;
  }
}