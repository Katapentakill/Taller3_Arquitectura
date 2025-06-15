import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ required: true })
  videoId: string;

  @Prop({ required: true })
  usuarioId: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);