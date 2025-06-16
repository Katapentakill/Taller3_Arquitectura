import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Action } from './schemas/action.schema';
import { ErrorLog } from './schemas/error.schema';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MonitoreoService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<Action>,
    @InjectModel(ErrorLog.name) private errorModel: Model<ErrorLog>,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy
  ) {}

  async registrarAccion(data: {
    userId?: string;
    userEmail?: string;
    url: string;
    method: string;
    description: string;
  }) {
    const action = new this.actionModel(data);
    await action.save();
  }

  async registrarError(data: {
    userId?: string;
    userEmail?: string;
    errorMessage: string;
  }) {
    const error = new this.errorModel(data);
    await error.save();
  }

  async listarAcciones(token: string) {
    const payload = await this.validarToken(token);
    const acciones = await this.actionModel.find().sort({ timestamp: -1 }).lean();

    return { acciones };
  }

  async listarErrores(token: string) {
    const payload = await this.validarToken(token);
    const errores = await this.errorModel.find().sort({ timestamp: -1 }).lean();

    return { errores };
  }

  private async validarToken(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido');

    const payload = await lastValueFrom(
      this.authClient.send('verificar.token', { token })
    ).catch(() => {
      throw new UnauthorizedException('Token inválido');
    });

    return payload;
  }
}