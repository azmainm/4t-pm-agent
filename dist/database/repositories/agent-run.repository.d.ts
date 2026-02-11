import { Model } from 'mongoose';
import { AgentRun } from '../schemas/agent-run.schema.js';
export declare class AgentRunRepository {
    private readonly agentRunModel;
    constructor(agentRunModel: Model<AgentRun>);
    create(data: Partial<AgentRun>): Promise<AgentRun>;
    findByRunId(runId: string): Promise<AgentRun | null>;
    updateStatus(runId: string, status: AgentRun['status'], updates?: Partial<AgentRun>): Promise<AgentRun | null>;
    addStep(runId: string, step: {
        stepName: string;
        startedAt: Date;
        completedAt?: Date;
        durationMs?: number;
        success: boolean;
        error?: string;
        metadata?: Record<string, unknown>;
    }): Promise<AgentRun | null>;
    updateStats(runId: string, stats: Partial<AgentRun['stats']>): Promise<AgentRun | null>;
    findRecent(limit: number): Promise<AgentRun[]>;
}
