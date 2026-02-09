import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'teamsMessages', timestamps: true })
export class TeamsMessage extends Document {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true, enum: ['channel', 'chat'] })
  source: 'channel' | 'chat';

  @Prop({ required: true })
  channelOrChatId: string;

  @Prop({ required: true })
  channelOrChatName: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  replyToId?: string;
}

export const TeamsMessageSchema = SchemaFactory.createForClass(TeamsMessage);
TeamsMessageSchema.index({ timestamp: -1 });
TeamsMessageSchema.index({ messageId: 1 }, { unique: true });
TeamsMessageSchema.index({ source: 1, channelOrChatId: 1 });
