import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'sprintPlans', timestamps: true })
export class SprintPlan extends Document {
  @Prop({ required: true })
  sprintStartDate: Date;

  @Prop({ required: true })
  sprintEndDate: Date;

  @Prop({ required: true, type: Object })
  planData: {
    sprintDateRange: { start: string; end: string };
    primaryGoals: string[];
    notes: string[];
    ownerBreakdown: Array<{
      name: string;
      focuses: Array<{
        focusName: string;
        goal: string;
        tasks: Array<{
          title: string;
          description: string;
          points: number;
          priority: string;
          acceptanceCriteria: string[];
        }>;
      }>;
    }>;
  };

  @Prop()
  onedriveFileId?: string;

  @Prop()
  onedriveFileName?: string;

  @Prop({ default: 'draft', enum: ['draft', 'generated', 'approved', 'archived'] })
  status: 'draft' | 'generated' | 'approved' | 'archived';

  @Prop()
  approvedAt?: Date;

  @Prop()
  extractedText?: string;

  @Prop({ type: [String] })
  jiraIssueKeys?: string[];
}

export const SprintPlanSchema = SchemaFactory.createForClass(SprintPlan);
SprintPlanSchema.index({ sprintStartDate: -1 });
SprintPlanSchema.index({ status: 1 });
