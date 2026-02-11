import { Model } from 'mongoose';
import { TeamsMessage } from '../schemas/teams-message.schema.js';
export declare class TeamsMessageRepository {
    private readonly messageModel;
    constructor(messageModel: Model<TeamsMessage>);
    createMany(messages: Partial<TeamsMessage>[]): Promise<TeamsMessage[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<TeamsMessage[]>;
    findByMessageId(messageId: string): Promise<TeamsMessage | null>;
    findBySource(source: 'channel' | 'chat', startDate: Date, endDate: Date): Promise<TeamsMessage[]>;
    deleteOlderThan(date: Date): Promise<number>;
}
