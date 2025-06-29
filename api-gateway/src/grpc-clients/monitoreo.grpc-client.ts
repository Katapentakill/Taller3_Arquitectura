import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const monitoreoClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'monitoreo',
    protoPath: join(__dirname, '../../../proto/monitoreo.proto'),
    url: 'monitoreo:50058',
  },
};
