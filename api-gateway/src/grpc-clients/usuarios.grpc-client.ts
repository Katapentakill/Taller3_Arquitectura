import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const usuariosClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'usuarios',
    protoPath: join(__dirname, '../../../proto/usuarios.proto'),
    url: 'localhost:50051',
  },
};