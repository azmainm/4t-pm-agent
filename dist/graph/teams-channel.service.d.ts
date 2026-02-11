import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';
export interface TeamsMessageData {
    messageId: string;
    source: 'channel';
    channelOrChatId: string;
    channelOrChatName: string;
    senderName: string;
    senderEmail: string;
    content: string;
    htmlContent: string;
    sentAt: Date;
    parentMessageId?: string;
    mentions: string[];
    isReply: boolean;
}
export declare class TeamsChannelService {
    private readonly graphClient;
    private readonly configService;
    private readonly logger;
    constructor(graphClient: GraphClientService, configService: ConfigService, logger: PinoLogger);
    fetchAllChannelMessages(startDate: Date, endDate: Date): Promise<TeamsMessageData[]>;
    fetchRecentMessages(daysBack: number): Promise<TeamsMessageData[]>;
    private fetchChannelMessages;
    private fetchReplies;
    private mapMessage;
    private stripHtml;
    private extractMentions;
}
