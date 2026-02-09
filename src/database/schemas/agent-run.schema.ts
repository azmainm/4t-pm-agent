import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'agentRuns', timestamps: true })
export class AgentRun extends Document {
  @Prop({ required: true })
  runId: string;

  @Prop({ required: true, enum: ['ingestion', 'sprint_plan'] })
  runType: 'ingestion' | 'sprint_plan';

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 'running', enum: ['running', 'completed', 'failed'] })
  status: 'running' | 'completed' | 'failed';

  @Prop()
  error?: string;

  @Prop({ type: Object })
  stats?: {
    transcriptsFetched?: number;
    messagesFetched?: number;
    summariesGenerated?: number;
    llmTokensUsed?: number;
    llmCost?: number;
    agentIterations?: number;
    durationMs?: number;
  };

  @Prop({ type: [Object] })
  steps?: Array<{
    stepName: string;
    startedAt: Date;
    completedAt?: Date;
    durationMs?: number;
    success: boolean;
    error?: string;
    metadata?: Record<string, unknown>;
  }>;

  @Prop()
  sprintPlanId?: string;

  @Prop()
  requestId?: string;
}

export const AgentRunSchema = SchemaFactory.createForClass(AgentRun);
AgentRunSchema.index({ runId: 1 }, { unique: true });
AgentRunSchema.index({ runType: 1, startedAt: -1 });
AgentRunSchema.index({ status: 1 });
