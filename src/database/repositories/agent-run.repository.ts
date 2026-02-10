import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentRun } from '../schemas/agent-run.schema.js';

@Injectable()
export class AgentRunRepository {
  constructor(
    @InjectModel(AgentRun.name, 'sprint_agent')
    private readonly agentRunModel: Model<AgentRun>,
  ) {}

  async create(data: Partial<AgentRun>): Promise<AgentRun> {
    const run = new this.agentRunModel(data);
    return run.save();
  }

  async findByRunId(runId: string): Promise<AgentRun | null> {
    return this.agentRunModel.findOne({ runId }).exec();
  }

  async updateStatus(
    runId: string,
    status: AgentRun['status'],
    updates?: Partial<AgentRun>,
  ): Promise<AgentRun | null> {
    return this.agentRunModel
      .findOneAndUpdate(
        { runId },
        { status, completedAt: new Date(), ...updates },
        { new: true },
      )
      .exec();
  }

  async addStep(
    runId: string,
    step: {
      stepName: string;
      startedAt: Date;
      completedAt?: Date;
      durationMs?: number;
      success: boolean;
      error?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentRun | null> {
    return this.agentRunModel
      .findOneAndUpdate(
        { runId },
        { $push: { steps: step } },
        { new: true },
      )
      .exec();
  }

  async updateStats(
    runId: string,
    stats: Partial<AgentRun['stats']>,
  ): Promise<AgentRun | null> {
    return this.agentRunModel
      .findOneAndUpdate(
        { runId },
        { $set: { stats } },
        { new: true },
      )
      .exec();
  }

  async findRecent(limit: number): Promise<AgentRun[]> {
    return this.agentRunModel
      .find()
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();
  }
}
