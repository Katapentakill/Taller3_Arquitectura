import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaModule } from './factura/factura.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_FACTURAS_HOST as string,
      port: parseInt(process.env.DB_FACTURAS_PORT as string),
      username: process.env.DB_FACTURAS_USERNAME as string,
      password: process.env.DB_FACTURAS_PASSWORD as string,
      database: process.env.DB_FACTURAS_NAME as string,
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,
    }),
    FacturaModule,
  ],
})
export class AppModule {}
