import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
export interface EmbeddingResult {
    text: string;
    embedding: number[];
    sourceType: string;
    date: Date;
    metadata: Record<string, unknown>;
}
export declare class EmbeddingService {
    private readonly configService;
    private readonly logger;
    private openai;
    private embeddingModel;
    constructor(configService: ConfigService, logger: PinoLogger);
    generateEmbeddings(texts: string[], sourceType: string, date: Date, metadata?: Record<string, unknown>): Promise<EmbeddingResult[]>;
    chunkText(text: string): string[];
    generateSingleEmbedding(text: string): Promise<number[]>;
}
