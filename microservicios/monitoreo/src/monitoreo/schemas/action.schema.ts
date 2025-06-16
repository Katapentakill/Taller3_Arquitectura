import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Action extends Document {
  @Prop()
  userId: string;

  @Prop()
  email: string;

  @Prop()
  urlMetodo: string;

  @Prop()
  accion: string;

  @Prop({ default: Date.now })
  fecha: Date;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
