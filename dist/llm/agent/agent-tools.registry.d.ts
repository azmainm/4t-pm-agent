import { PinoLogger } from 'nestjs-pino';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { FetchSummariesTool } from './tools/fetch-summaries.tool.js';
import { FetchTranscriptsTool } from './tools/fetch-transcripts.tool.js';
import { FetchMessagesTool } from './tools/fetch-messages.tool.js';
import { FetchPreviousPlanTool } from './tools/fetch-previous-plan.tool.js';
import { SearchContextTool } from './tools/search-context.tool.js';
import { GeneratePlanTool } from './tools/generate-plan.tool.js';
export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;
export declare class AgentToolsRegistry {
    private readonly fetchSummariesTool;
    private readonly fetchTranscriptsTool;
    private readonly fetchMessagesTool;
    private readonly fetchPreviousPlanTool;
    private readonly searchContextTool;
    private readonly generatePlanTool;
    private readonly logger;
    private tools;
    constructor(fetchSummariesTool: FetchSummariesTool, fetchTranscriptsTool: FetchTranscriptsTool, fetchMessagesTool: FetchMessagesTool, fetchPreviousPlanTool: FetchPreviousPlanTool, searchContextTool: SearchContextTool, generatePlanTool: GeneratePlanTool, logger: PinoLogger);
    registerHandlers(handlers: Record<string, ToolHandler>): void;
    getToolDefinitions(): ChatCompletionTool[];
    executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
    hasHandler(name: string): boolean;
}
