import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoreoController } from './monitoreo.controller';
import { MonitoreoService } from './monitoreo.service';
import { Action, ActionSchema } from './schemas/action.schema';
import { ErrorLog, ErrorLogSchema } from './schemas/error.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Action.name, schema: ActionSchema },
      { name: ErrorLog.name, schema: ErrorLogSchema },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string],
          queue: 'auth_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [MonitoreoController],
  providers: [MonitoreoService],
  exports: [MonitoreoService],
})
export class MonitoreoModule {}