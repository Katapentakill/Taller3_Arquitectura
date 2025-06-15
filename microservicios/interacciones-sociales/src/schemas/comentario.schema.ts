import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ComentarioDocument = Comentario & Document;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true })
  videoId: string;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  texto: string;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);