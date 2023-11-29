import { Schema, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export abstract class BaseDocument extends Document {
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}
