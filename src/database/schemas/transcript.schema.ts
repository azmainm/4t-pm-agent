import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: string;
  endTime: string;
}

@Schema({ collection: 'transcripts', timestamps: true })
export class Transcript extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  meetingSubject: string;

  @Prop({ required: true })
  meetingId: string;

  @Prop({ type: Object, required: true })
  segments: TranscriptSegment[];

  @Prop()
  rawVttContent?: string;

  @Prop({ type: Object })
  dailySummary?: {
    overallSummary: string;
    perPersonSummary: Array<{
      person: string;
      progressItems: string[];
      blockers: string[];
      nextSteps: string[];
    }>;
    actionItems: string[];
    decisions: string[];
    blockers: string[];
    keyTopics: string[];
  };
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
TranscriptSchema.index({ date: -1 });
TranscriptSchema.index({ meetingId: 1 });
