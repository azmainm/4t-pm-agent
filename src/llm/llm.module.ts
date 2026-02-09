import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service.js';
import { SummarizationService } from './summarization.service.js';
import { ReactAgentService } from './agent/react-agent.service.js';
import { AgentToolsRegistry } from './agent/agent-tools.registry.js';
import { FetchSummariesTool } from './agent/tools/fetch-summaries.tool.js';
import { FetchTranscriptsTool } from './agent/tools/fetch-transcripts.tool.js';
import { FetchMessagesTool } from './agent/tools/fetch-messages.tool.js';
import { FetchPreviousPlanTool } from './agent/tools/fetch-previous-plan.tool.js';
import { SearchContextTool } from './agent/tools/search-context.tool.js';
import { GeneratePlanTool } from './agent/tools/generate-plan.tool.js';

@Module({
  providers: [
    OpenaiService,
    SummarizationService,
    ReactAgentService,
    AgentToolsRegistry,
    FetchSummariesTool,
    FetchTranscriptsTool,
    FetchMessagesTool,
    FetchPreviousPlanTool,
    SearchContextTool,
    GeneratePlanTool,
  ],
  exports: [
    OpenaiService,
    SummarizationService,
    ReactAgentService,
    AgentToolsRegistry,
  ],
})
export class LlmModule {}
