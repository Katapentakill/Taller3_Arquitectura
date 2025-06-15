import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import { Like, LikeDocument } from '../schemas/like.schema';

@Injectable()
export class InteraccionService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  async crearComentario(data: { videoId: string; usuarioId: string; texto: string }) {
    return this.comentarioModel.create(data);
  }

  async obtenerComentarios(videoId: string) {
    return this.comentarioModel.find({ videoId }).sort({ createdAt: -1 }).exec();
  }

  async darLike(videoId: string, usuarioId: string) {
    const existe = await this.likeModel.findOne({ videoId, usuarioId });
    if (!existe) {
      return this.likeModel.create({ videoId, usuarioId });
    }
    return null; // Ya existe
  }

  async quitarLike(videoId: string, usuarioId: string) {
    return this.likeModel.deleteOne({ videoId, usuarioId }).exec();
  }

  async contarLikes(videoId: string) {
    return this.likeModel.countDocuments({ videoId }).exec();
  }
}