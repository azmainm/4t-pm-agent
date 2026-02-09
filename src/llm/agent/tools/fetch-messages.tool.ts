import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class FetchMessagesTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'fetch_teams_messages',
      description:
        'Fetches Teams channel and chat messages from the last N days. Returns sender, content, timestamp, and source channel/chat.',
      parameters: {
        type: 'object',
        properties: {
          daysBack: {
            type: 'number',
            description: 'Number of days to look back (default: 14)',
          },
        },
        required: [],
      },
    },
  };
}
