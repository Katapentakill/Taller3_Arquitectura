import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const listasClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'listas',
    protoPath: join(__dirname, '../../../proto/listaReproduccion.proto'),
    url: 'listas:50054', // Correcto dentro de Docker
  },
};
