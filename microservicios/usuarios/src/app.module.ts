import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { Usuario } from './Entity/usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get('DB_USERS_HOST'),
        port: config.get<number>('DB_USERS_PORT'),
        username: config.get('DB_USERS_USERNAME'),
        password: config.get('DB_USERS_PASSWORD'),
        database: config.get('DB_USERS_NAME'),
        entities: [Usuario],
        synchronize: true,
      }),
    }),

    UsuariosModule,
  ],
})
export class AppModule {}
