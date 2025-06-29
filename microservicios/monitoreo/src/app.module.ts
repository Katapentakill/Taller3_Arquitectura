import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MonitoreoModule } from './monitoreo/monitoreo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 necesario para usar process.env en cualquier parte
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MonitoreoModule,
  ],
})
export class AppModule {}
