import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const interaccionesClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'interacciones',
    protoPath: join(__dirname, '../../../proto/interacciones.proto'),
    url: 'interacciones:50052',
  },
};