import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'contextEmbeddings', timestamps: true })
export class ContextEmbedding extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true, type: [Number] })
  embedding: number[];

  @Prop({ required: true, enum: ['transcript', 'message', 'document'] })
  sourceType: 'transcript' | 'message' | 'document';

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const ContextEmbeddingSchema = SchemaFactory.createForClass(ContextEmbedding);
ContextEmbeddingSchema.index({ sourceId: 1 });
ContextEmbeddingSchema.index({ sourceType: 1, date: -1 });
