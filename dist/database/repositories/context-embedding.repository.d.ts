import { Model } from 'mongoose';
import { ContextEmbedding } from '../schemas/context-embedding.schema.js';
export declare class ContextEmbeddingRepository {
    private readonly embeddingModel;
    constructor(embeddingModel: Model<ContextEmbedding>);
    createMany(embeddings: Partial<ContextEmbedding>[]): Promise<any[]>;
    vectorSearch(queryEmbedding: number[], limit?: number): Promise<ContextEmbedding[]>;
    deleteBySourceId(sourceId: string): Promise<number>;
    deleteOlderThan(date: Date): Promise<number>;
}
