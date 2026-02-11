import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { GraphClientService } from './graph-client.service.js';
export interface CalendarEvent {
    id: string;
    subject: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    onlineMeeting?: {
        joinUrl: string;
    };
}
export declare class CalendarService {
    private readonly graphClient;
    private readonly configService;
    private readonly logger;
    constructor(graphClient: GraphClientService, configService: ConfigService, logger: PinoLogger);
    getTodayEvents(subjectFilter: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
    fetchTodayStandup(): Promise<CalendarEvent | null>;
}
