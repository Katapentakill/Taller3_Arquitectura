import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const facturaClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'facturas',
    protoPath: join(__dirname, '../../../proto/facturas.proto'),
    url: 'facturas:50056',
  },
};
