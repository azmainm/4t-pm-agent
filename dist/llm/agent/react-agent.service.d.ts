import { PinoLogger } from 'nestjs-pino';
import { OpenaiService } from '../openai.service.js';
import { AgentToolsRegistry } from './agent-tools.registry.js';
import { type SprintPlanOutput } from '../dto/sprint-plan-output.dto.js';
export interface AgentIteration {
    iteration: number;
    toolCalls: string[];
    inputTokens: number;
    outputTokens: number;
    finishReason: string;
}
export interface AgentRunResult {
    plan: SprintPlanOutput;
    iterations: AgentIteration[];
    totalInputTokens: number;
    totalOutputTokens: number;
}
export declare class ReactAgentService {
    private readonly openaiService;
    private readonly toolsRegistry;
    private readonly logger;
    constructor(openaiService: OpenaiService, toolsRegistry: AgentToolsRegistry, logger: PinoLogger);
    runSprintPlanAgent(systemPrompt: string, userMessage: string): Promise<AgentRunResult>;
    private parseAndValidateOutput;
    callLLM(prompt: string): Promise<string>;
}
