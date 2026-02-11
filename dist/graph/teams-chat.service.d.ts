import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';
export interface TeamsChatMessageData {
    messageId: string;
    source: 'chat';
    channelOrChatId: string;
    channelOrChatName: string;
    senderName: string;
    senderEmail: string;
    content: string;
    htmlContent: string;
    sentAt: Date;
    mentions: string[];
    isReply: boolean;
}
export declare class TeamsChatService {
    private readonly graphClient;
    private readonly configService;
    private readonly logger;
    constructor(graphClient: GraphClientService, configService: ConfigService, logger: PinoLogger);
    fetchAllChatMessages(startDate: Date, endDate: Date): Promise<TeamsChatMessageData[]>;
    fetchRecentMessages(daysBack: number): Promise<TeamsChatMessageData[]>;
    private fetchChatMessages;
    private stripHtml;
}
