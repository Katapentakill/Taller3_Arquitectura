import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListaReproduccion } from './entities/lista-reproduccion.entity';
import { ListaVideo } from './entities/lista-video.entity';
import { ListasModule } from './listas/listas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_LISTAS_HOST'),
        port: config.get<number>('DB_LISTAS_PORT'),
        username: config.get('DB_LISTAS_USERNAME'),
        password: config.get('DB_LISTAS_PASSWORD'),
        database: config.get('DB_LISTAS_NAME'),
        entities: [ListaReproduccion, ListaVideo],
        synchronize: true,
      }),
    }),
    ListasModule,
  ],
})
export class AppModule {}