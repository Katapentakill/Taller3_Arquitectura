import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoreoModule } from './monitoreo/monitoreo.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MonitoreoModule,
  ],
})
export class AppModule {}