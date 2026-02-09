import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamsMessage } from '../schemas/teams-message.schema.js';

@Injectable()
export class TeamsMessageRepository {
  constructor(
    @InjectModel(TeamsMessage.name)
    private readonly messageModel: Model<TeamsMessage>,
  ) {}

  async createMany(messages: Partial<TeamsMessage>[]): Promise<TeamsMessage[]> {
    return this.messageModel.insertMany(messages, { ordered: false });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<TeamsMessage[]> {
    return this.messageModel
      .find({
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  async findByMessageId(messageId: string): Promise<TeamsMessage | null> {
    return this.messageModel.findOne({ messageId }).exec();
  }

  async findBySource(
    source: 'channel' | 'chat',
    startDate: Date,
    endDate: Date,
  ): Promise<TeamsMessage[]> {
    return this.messageModel
      .find({
        source,
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.messageModel.deleteMany({
      timestamp: { $lt: date },
    });
    return result.deletedCount || 0;
  }
}
