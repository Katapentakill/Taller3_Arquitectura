import { Injectable, HttpException, HttpStatus, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, NullExpression, Types } from 'mongoose';
import { Video } from '../Entity/video.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class VideosService {
    constructor(
        @InjectModel(Video.name) private readonly videoModel: Model<Video>,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitMQService: ClientProxy
    ) {}

    async crearVideo(data: any) {
        console.log('Datos recibidos para crear video:', data);    
    }

    async  obtenerVideo(id: string) {

    }

    async actualizarVideo(id: string, data: any) {

    }

    async eliminarVideo(id: string) {

    }

    async obtenerTodosVideos(query: string) {
        
    }
}
