import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ErrorLog extends Document {
  @Prop()
  userId: string;

  @Prop()
  email: string;

  @Prop()
  error: string;

  @Prop({ default: Date.now })
  fecha: Date;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);