import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class FetchPreviousPlanTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'fetch_previous_sprint_plan',
      description:
        'Fetches the previous sprint plan document text. Use this to understand what was planned, compare against what was actually done, and follow the same output format.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  };
}
