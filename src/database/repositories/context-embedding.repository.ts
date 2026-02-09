import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContextEmbedding } from '../schemas/context-embedding.schema.js';

@Injectable()
export class ContextEmbeddingRepository {
  constructor(
    @InjectModel(ContextEmbedding.name)
    private readonly embeddingModel: Model<ContextEmbedding>,
  ) {}

  async createMany(embeddings: Partial<ContextEmbedding>[]): Promise<any[]> {
    return this.embeddingModel.insertMany(embeddings);
  }

  async vectorSearch(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<ContextEmbedding[]> {
    // Note: This requires MongoDB Atlas Vector Search index to be configured
    // For now, returning empty array as placeholder
    // In production, use: $vectorSearch aggregation stage
    return [];
  }

  async deleteBySourceId(sourceId: string): Promise<number> {
    const result = await this.embeddingModel.deleteMany({ sourceId });
    return result.deletedCount || 0;
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.embeddingModel.deleteMany({
      date: { $lt: date },
    });
    return result.deletedCount || 0;
  }
}
