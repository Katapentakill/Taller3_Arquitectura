import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const authClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(__dirname, '../../../proto/auth.proto'),
    url: 'localhost:50052',
  },
};