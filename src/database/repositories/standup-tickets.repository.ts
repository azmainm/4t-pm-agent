import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db, Collection } from 'mongodb';
import { PinoLogger } from 'nestjs-pino';

export interface StandupTranscript {
  _id: string;
  timestamp: Date;
  date: string;
  transcript_data: Array<{
    speaker: string;
    timestamp: string;
    text: string;
  }>;
  meeting_id: string | null;
  entry_count: number;
  meeting_notes?: string;
  attendees?: string[];
  notes_generated_at?: Date;
}

@Injectable()
export class StandupTicketsRepository {
  private client: MongoClient;
  private db: Db;
  private transcriptsCollection: Collection<StandupTranscript>;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('StandupTicketsRepository');
    this.initialize();
  }

  private async initialize() {
    const uri = this.configService.get<string>('mongodb.standupTicketsUri')!;
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db('standuptickets');
    this.transcriptsCollection = this.db.collection<StandupTranscript>('transcripts');
    this.logger.info('Connected to standuptickets database');
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StandupTranscript[]> {
    await this.ensureConnected();
    return this.transcriptsCollection
      .find({
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .toArray();
  }

  async findLatest(limit: number): Promise<StandupTranscript[]> {
    await this.ensureConnected();
    return this.transcriptsCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async findByDate(date: Date): Promise<StandupTranscript | null> {
    await this.ensureConnected();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.transcriptsCollection.findOne({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  private async ensureConnected() {
    if (!this.client || !this.db) {
      await this.initialize();
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.info('Closed standuptickets database connection');
    }
  }
}
