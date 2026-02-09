import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcript } from '../schemas/transcript.schema.js';

@Injectable()
export class TranscriptRepository {
  constructor(
    @InjectModel(Transcript.name)
    private readonly transcriptModel: Model<Transcript>,
  ) {}

  async create(data: Partial<Transcript>): Promise<Transcript> {
    const transcript = new this.transcriptModel(data);
    return transcript.save();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transcript[]> {
    return this.transcriptModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findByMeetingId(meetingId: string): Promise<Transcript | null> {
    return this.transcriptModel.findOne({ meetingId }).exec();
  }

  async findLatest(limit: number): Promise<Transcript[]> {
    return this.transcriptModel.find().sort({ date: -1 }).limit(limit).exec();
  }

  async updateDailySummary(
    id: string,
    dailySummary: Transcript['dailySummary'],
  ): Promise<Transcript | null> {
    return this.transcriptModel
      .findByIdAndUpdate(id, { dailySummary }, { new: true })
      .exec();
  }

  async findWithSummaries(startDate: Date, endDate: Date): Promise<Transcript[]> {
    return this.transcriptModel
      .find({
        date: { $gte: startDate, $lte: endDate },
        dailySummary: { $exists: true },
      })
      .sort({ date: 1 })
      .exec();
  }
}
