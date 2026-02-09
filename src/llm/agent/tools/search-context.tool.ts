import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class SearchContextTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'search_context',
      description:
        'Performs a semantic search across all stored context (transcripts, messages, sprint plans) to find specific information. Use this when you need details about a specific topic, person, or project.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'The search query describing what information you need',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)',
          },
        },
        required: ['query'],
      },
    },
  };
}
