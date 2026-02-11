import { Model } from 'mongoose';
import { DailySummary } from '../schemas/daily-summary.schema.js';
export declare class DailySummaryRepository {
    private readonly summaryModel;
    constructor(summaryModel: Model<DailySummary>);
    create(data: Partial<DailySummary>): Promise<DailySummary>;
    findByDateRange(startDate: Date, endDate: Date): Promise<DailySummary[]>;
    findLatest(limit: number): Promise<DailySummary[]>;
    findByDate(date: Date): Promise<DailySummary | null>;
}
