import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaModule } from './factura/factura.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Factura } from './entity/factura.entity';

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
        database: config.get('DB_FACTURAS_NAME'),
        entities: [Factura],
        synchronize: true,
      }),
    }),
    FacturaModule,
  ],
})
export class AppModule {}