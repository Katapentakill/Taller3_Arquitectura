import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InteraccionesModule } from './interacciones/interacciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_INTERACCIONES_URI'),
      }),
      inject: [ConfigService],
    }),
    InteraccionesModule,
  ],
})
export class AppModule {}