import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { authClientOptions } from '../grpc-clients/auth.grpc-client';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        ...authClientOptions,
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}