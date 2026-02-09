import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class FetchSummariesTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'fetch_sprint_summaries',
      description:
        'Fetches daily standup summaries from the last N days. Returns per-person progress, action items, decisions, and blockers extracted from each standup transcript.',
      parameters: {
        type: 'object',
        properties: {
          daysBack: {
            type: 'number',
            description:
              'Number of days to look back (default: 14 for a full sprint)',
          },
        },
        required: [],
      },
    },
  };
}
