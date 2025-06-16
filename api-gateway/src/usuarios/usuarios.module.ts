import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { usuariosClientOptions } from '../grpc-clients/usuarios.grpc-client';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USUARIOS_PACKAGE',
        ...usuariosClientOptions,
      },
    ]),
  ],
  controllers: [UsuariosController],
})
export class UsuariosModule {}