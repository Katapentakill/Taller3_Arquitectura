import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { TokenBlacklist } from './entities/blacklist.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      type: 'postgres',
      host: config.get('DB_AUTH_HOST'),
      port: config.get<number>('DB_AUTH_PORT'),
      username: config.get('DB_AUTH_USERNAME'),
      password: config.get('DB_AUTH_PASSWORD'),
      database: config.get('DB_AUTH_NAME'),
      entities: [User, TokenBlacklist],
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000, // en milisegundos
    }),
  }),


    AuthModule,
  ],
})
export class AppModule {}