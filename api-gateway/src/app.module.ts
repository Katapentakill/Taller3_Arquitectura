import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ListasModule } from './listas/listas.module';
import { VideoModule } from './videos/video.module';
import { FacturaModule } from './factura/factura.module';
import { InteraccionesModule } from './interacciones/interacciones.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';

@Module({
  imports: [UsuariosModule, AuthModule, ListasModule,VideoModule,FacturaModule,InteraccionesModule,MonitoreoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
