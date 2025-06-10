import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Esquema de la colección Videos en MongoDB.
 */
@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
