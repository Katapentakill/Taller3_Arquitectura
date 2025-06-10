import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
    constructor(private readonly videosService: VideosService) {}

    @GrpcMethod('VideosService', 'crearVideo')
    async crearVideo(data: any): Promise<any> {
        return this.videosService.crearVideo(data);
    }

    @GrpcMethod('VideosService', 'obtenerVideoPorId')
    async obtenerVideo(id: string): Promise<any> {
        return this.videosService.obtenerVideo(id);
    }

    @GrpcMethod('VideosService', 'actualizarVideo')
    async actualizarVideo(data: { id: string; video: any }): Promise<any> {
        return this.videosService.actualizarVideo(data.id, data.video);
    }

    @GrpcMethod('VideosService', 'eliminarVideo')
    async eliminarVideo(id: string): Promise<any> {
        return this.videosService.eliminarVideo(id);
    }
}
