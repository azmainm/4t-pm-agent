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

    this.logger.debug(
      { model, messageCount: params.messages.length },
      'OpenAI chat completion request',
    );

    const response = await this.client.chat.completions.create({
      ...params,
      model,
    });

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
