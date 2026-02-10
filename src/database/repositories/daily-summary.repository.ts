import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySummary } from '../schemas/daily-summary.schema.js';

@Injectable()
export class DailySummaryRepository {
  constructor(
    @InjectModel(DailySummary.name, 'sprint_agent')
    private readonly summaryModel: Model<DailySummary>,
  ) {}

  async create(data: Partial<DailySummary>): Promise<DailySummary> {
    const summary = new this.summaryModel(data);
    return summary.save();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DailySummary[]> {
    return this.summaryModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findLatest(limit: number): Promise<DailySummary[]> {
    return this.summaryModel.find().sort({ date: -1 }).limit(limit).exec();
  }

  async findByDate(date: Date): Promise<DailySummary | null> {
    return this.summaryModel.findOne({ date }).exec();
  }
}
