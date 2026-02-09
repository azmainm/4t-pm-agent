import { Injectable } from '@nestjs/common';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

@Injectable()
export class GeneratePlanTool {
  readonly definition: ChatCompletionTool = {
    type: 'function',
    function: {
      name: 'generate_sprint_plan',
      description:
        'Call this when you have gathered and analyzed all context and are ready to output the final sprint plan. Pass the complete structured sprint plan JSON.',
      parameters: {
        type: 'object',
        properties: {
          plan: {
            type: 'object',
            description:
              'The complete sprint plan JSON matching the required output schema',
          },
        },
        required: ['plan'],
      },
    },
  };
}
