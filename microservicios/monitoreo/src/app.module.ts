import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/monitoreo_db'),
    LogsModule,
  ],
})
export class AppModule {}