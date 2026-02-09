import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import OpenAI from 'openai';

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  sourceType: string;
  date: Date;
  metadata: Record<string, unknown>;
}

const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50;

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;
  private embeddingModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('EmbeddingService');
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
    this.embeddingModel = this.configService.get<string>(
      'openai.embeddingModel',
      'text-embedding-3-small',
    );
  }

  async generateEmbeddings(
    texts: string[],
    sourceType: string,
    date: Date,
    metadata: Record<string, unknown> = {},
  ): Promise<EmbeddingResult[]> {
    if (texts.length === 0) return [];

    // Chunk texts
    const chunks = texts.flatMap((text) => this.chunkText(text));

    this.logger.info(
      { sourceType, textCount: texts.length, chunkCount: chunks.length },
      'Generating embeddings',
    );

    const results: EmbeddingResult[] = [];
    const batchSize = 100; // OpenAI supports up to 2048 inputs

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: batch,
      });

      for (let j = 0; j < response.data.length; j++) {
        results.push({
          text: batch[j],
          embedding: response.data[j].embedding,
          sourceType,
          date,
          metadata: { ...metadata, chunkIndex: i + j },
        });
      }
    }

    this.logger.info(
      { sourceType, embeddingCount: results.length },
      'Embeddings generated',
    );

    return results;
  }

  chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE, text.length);
      chunks.push(text.slice(start, end));
      start = end - CHUNK_OVERLAP;
      if (start >= text.length) break;
    }

    return chunks.filter((c) => c.trim().length > 0);
  }

  async generateSingleEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  }
}
