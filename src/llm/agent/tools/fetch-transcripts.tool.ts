import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class FetchTranscriptsTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'fetch_sprint_transcripts',
      description:
        'Fetches raw transcript segments from the last N days. Use this only when you need detailed raw dialogue that the summaries might have missed.',
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
