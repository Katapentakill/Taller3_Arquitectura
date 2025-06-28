// src/grpc-clients/usuarios.grpc-client.ts

import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const usuariosClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'usuarios',
    protoPath: join(__dirname, '../../../proto/usuarios.proto'),
    url: 'usuarios:50051', // ✅ Arreglo aquí
  },
};
