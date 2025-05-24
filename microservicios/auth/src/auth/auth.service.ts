import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklist } from '../entities/blacklist.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(TokenBlacklist)
    private readonly blacklistRepo: Repository<TokenBlacklist>,
    private readonly jwtService: JwtService,
  ) {}

  async registrarUsuario(correo: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ correo, password: hashed });
    return this.repo.save(user);
  }

  async login(correo: string, password: string): Promise<string> {
    const user = await this.repo.findOne({ where: { correo } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, correo: user.correo };
    const token = this.jwtService.sign(payload);

    return token;
  }

  async logout(token: string) {
    const payload: any = this.jwtService.decode(token);
    if (!payload?.exp) throw new BadRequestException('Token inválido');

    const expiration = new Date(payload.exp * 1000);
    const entry = this.blacklistRepo.create({ token, expiresAt: expiration });
    await this.blacklistRepo.save(entry);

    return { message: 'Sesión cerrada exitosamente' };
  }

  async verificarToken(token: string) {
    const isBlacklisted = await this.blacklistRepo.findOne({ where: { token } });
    if (isBlacklisted) throw new UnauthorizedException('Token en blacklist');
    return this.jwtService.verify(token);
  }

  async actualizarPassword(
    id: string,
    passwordActual: string,
    nuevaPassword: string,
    confirmarPassword: string,
  ) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(passwordActual, user.password);
    if (!isValid) throw new UnauthorizedException('Contraseña actual incorrecta');

    if (nuevaPassword !== confirmarPassword) {
      throw new BadRequestException('Las nuevas contraseñas no coinciden');
    }

    user.password = await bcrypt.hash(nuevaPassword, 10);
    await this.repo.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}