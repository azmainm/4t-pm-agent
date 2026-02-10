import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import OpenAI from 'openai';
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletion,
} from 'openai/resources/chat/completions';

@Injectable()
export class OpenaiService {
  private client: OpenAI;
  private model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('OpenaiService');
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
    this.model = this.configService.get<string>('openai.model', 'gpt-5-nano');
  }

  async chatCompletion(
    params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'> & {
      model?: string;
    },
  ): Promise<ChatCompletion> {
    const model = params.model || this.model;
    const startTime = Date.now();
    const isGpt5Model = /^gpt-5-/i.test(model);

    this.logger.debug(
      { model, messageCount: params.messages.length, useResponsesApi: isGpt5Model },
      'OpenAI chat completion request',
    );

    let response: ChatCompletion;

    if (isGpt5Model) {
      // GPT-5 models use Responses API
      const combinedInput = params.messages
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const apiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.configService.get<string>('openai.apiKey')}`,
        },
        body: JSON.stringify({
          model,
          input: combinedInput,
          max_output_tokens: params.max_tokens || 4000,
          reasoning: { effort: 'minimal' },
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        throw new Error(`OpenAI Responses API error: ${apiResponse.status} ${error}`);
      }

      const data: any = await apiResponse.json();
      
      // Log the raw response for debugging
      this.logger.debug({ responsesApiData: data }, 'Raw Responses API response');
      
      // Extract content from Responses API structure
      // output is an array: [{ type: "reasoning", ... }, { type: "message", content: [...] }]
      let content = '';
      
      if (Array.isArray(data.output)) {
        // Find the message object in the output array
        const messageObj = data.output.find((item: any) => item.type === 'message');
        if (messageObj && Array.isArray(messageObj.content)) {
          // Find the output_text in the content array
          const textObj = messageObj.content.find((item: any) => item.type === 'output_text');
          if (textObj && textObj.text) {
            content = textObj.text;
          }
        }
      } else {
        // Fallback for non-array responses
        content = data.output || data.content || '';
      }
      
      this.logger.debug({ contentLength: content.length, contentType: typeof content }, 'Extracted content from Responses API');
      
      // Convert Responses API format to Chat Completion format
      response = {
        id: data.id || 'resp-' + Date.now(),
        object: 'chat.completion',
        created: data.created || Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content,
            },
            finish_reason: 'stop',
            logprobs: null,
          },
        ],
        usage: data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      } as ChatCompletion;
    } else {
      // Standard Chat API for other models
      response = await this.client.chat.completions.create({
        ...params,
        model,
      });
    }

    const durationMs = Date.now() - startTime;
    this.logger.info(
      {
        model,
        durationMs,
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
        finishReason: response.choices[0]?.finish_reason,
      },
      'OpenAI chat completion response',
    );

    return response;
  }

  getDefaultModel(): string {
    return this.model;
  }
}
