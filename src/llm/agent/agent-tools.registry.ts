import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { FetchSummariesTool } from './tools/fetch-summaries.tool.js';
import { FetchTranscriptsTool } from './tools/fetch-transcripts.tool.js';
import { FetchMessagesTool } from './tools/fetch-messages.tool.js';
import { FetchPreviousPlanTool } from './tools/fetch-previous-plan.tool.js';
import { SearchContextTool } from './tools/search-context.tool.js';
import { GeneratePlanTool } from './tools/generate-plan.tool.js';

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface RegisteredTool {
  definition: ChatCompletionTool;
  handler: ToolHandler;
}

@Injectable()
export class AgentToolsRegistry {
  private tools: Map<string, RegisteredTool> = new Map();

  constructor(
    private readonly fetchSummariesTool: FetchSummariesTool,
    private readonly fetchTranscriptsTool: FetchTranscriptsTool,
    private readonly fetchMessagesTool: FetchMessagesTool,
    private readonly fetchPreviousPlanTool: FetchPreviousPlanTool,
    private readonly searchContextTool: SearchContextTool,
    private readonly generatePlanTool: GeneratePlanTool,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('AgentToolsRegistry');
  }

  registerHandlers(handlers: Record<string, ToolHandler>): void {
    const toolInstances = [
      this.fetchSummariesTool,
      this.fetchTranscriptsTool,
      this.fetchMessagesTool,
      this.fetchPreviousPlanTool,
      this.searchContextTool,
      this.generatePlanTool,
    ];

    for (const tool of toolInstances) {
      const name = (tool.definition as any).function.name;
      const handler = handlers[name];
      if (typeof handler === 'function') {
        this.tools.set(name, { definition: tool.definition, handler });
        this.logger.debug({ toolName: name }, 'Tool registered');
      }
    }
  }

  getToolDefinitions(): ChatCompletionTool[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  async executeTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    this.logger.info({ toolName: name, args }, 'Executing tool');
    const startTime = Date.now();

    const result = await tool.handler(args);

    this.logger.info(
      { toolName: name, durationMs: Date.now() - startTime },
      'Tool execution complete',
    );

    return result;
  }

  hasHandler(name: string): boolean {
    return this.tools.has(name);
  }
}
