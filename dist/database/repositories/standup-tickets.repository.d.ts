import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
export interface StandupTranscript {
    _id: string;
    timestamp: Date;
    date: string;
    transcript_data: string | Array<{
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
export declare class StandupTicketsRepository {
    private readonly configService;
    private readonly logger;
    private client;
    private db;
    private transcriptsCollection;
    constructor(configService: ConfigService, logger: PinoLogger);
    private initialize;
    findByDateRange(startDate: Date, endDate: Date): Promise<StandupTranscript[]>;
    private parseTranscript;
    findLatest(limit: number): Promise<StandupTranscript[]>;
    findByDate(date: Date): Promise<StandupTranscript | null>;
    private ensureConnected;
    onModuleDestroy(): Promise<void>;
}
