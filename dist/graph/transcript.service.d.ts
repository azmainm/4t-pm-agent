import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';
export declare class TranscriptService {
    private readonly graphClient;
    private readonly configService;
    private readonly logger;
    constructor(graphClient: GraphClientService, configService: ConfigService, logger: PinoLogger);
    extractMeetingId(joinUrl: string): string;
    fetchOnlineMeetingId(joinUrl: string): Promise<string>;
    fetchTranscript(meetingId: string): Promise<string>;
    private delay;
}
