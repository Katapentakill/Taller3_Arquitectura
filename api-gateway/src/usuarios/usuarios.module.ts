import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { usuariosClientOptions } from '../grpc-clients/usuarios.grpc-client';
import { authClientOptions } from '../grpc-clients/auth.grpc-client'; // 👈 importa esto
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USUARIOS_PACKAGE',
        ...usuariosClientOptions,
      },
      {
        name: 'AUTH_PACKAGE', // 👈 REGISTRA esto también
        ...authClientOptions,
      },
    ]),
  ],
  controllers: [UsuariosController],
})
export class UsuariosModule {}