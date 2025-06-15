import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const videosClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'videos',
    protoPath: join(__dirname, '../../../proto/videos.proto'),
    url: 'localhost:50055',
  },
};