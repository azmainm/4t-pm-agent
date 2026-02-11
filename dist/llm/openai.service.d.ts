import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import type { ChatCompletionCreateParamsNonStreaming, ChatCompletion } from 'openai/resources/chat/completions';
export declare class OpenaiService {
    private readonly configService;
    private readonly logger;
    private client;
    private model;
    constructor(configService: ConfigService, logger: PinoLogger);
    chatCompletion(params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'> & {
        model?: string;
    }): Promise<ChatCompletion>;
    getDefaultModel(): string;
}
