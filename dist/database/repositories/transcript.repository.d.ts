import { Model } from 'mongoose';
import { Transcript } from '../schemas/transcript.schema.js';
export declare class TranscriptRepository {
    private readonly transcriptModel;
    constructor(transcriptModel: Model<Transcript>);
    create(data: Partial<Transcript>): Promise<Transcript>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Transcript[]>;
    findByMeetingId(meetingId: string): Promise<Transcript | null>;
    findLatest(limit: number): Promise<Transcript[]>;
    updateDailySummary(id: string, dailySummary: Transcript['dailySummary']): Promise<Transcript | null>;
    findWithSummaries(startDate: Date, endDate: Date): Promise<Transcript[]>;
}
