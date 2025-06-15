// src/video/video.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { VideoController } from './video.controller';
import { videosClientOptions } from '../grpc-clients/videos.grpc-client';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'VIDEOS_PACKAGE',
                ...videosClientOptions,
            },
        ]),
    ],
    controllers: [VideoController],
})
export class VideoModule {}
