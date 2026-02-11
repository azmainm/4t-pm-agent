import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'dailySummaries', timestamps: true })
export class DailySummary extends Document {
  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true })
  transcriptId: string; // Reference to standuptickets.transcripts._id

  @Prop({ required: true })
  overallSummary: string;

  @Prop({ type: [String], default: [] })
  actionItems: string[];

  @Prop({ type: [String], default: [] })
  decisions: string[];

  @Prop({ type: [String], default: [] })
  blockers: string[];

  @Prop({
    type: [
      {
        name: String,
        summary: String,
        nextSteps: [String],
      },
    ],
    default: [],
  })
  perPersonSummary: Array<{
    name: string;
    summary: string;
    nextSteps: string[];
  }>;

  @Prop({
    type: [
      {
        task: String,
        owner: String,
        status: String, // planned|started|completed_in_current_sprint
        targetSprint: String, // current|next
        priority: String, // high|medium|low
      },
    ],
    default: [],
  })
  upcomingWork: Array<{
    task: string;
    owner: string;
    status: string;
    targetSprint: string;
    priority: string;
  }>;

  @Prop()
  generatedAt: Date;
}

export const DailySummarySchema = SchemaFactory.createForClass(DailySummary);
DailySummarySchema.index({ date: -1 });
