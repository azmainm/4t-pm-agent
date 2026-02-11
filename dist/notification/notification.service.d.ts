import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
export declare class NotificationService {
    private readonly configService;
    private readonly logger;
    private webhookUrl;
    constructor(configService: ConfigService, logger: PinoLogger);
    sendSprintPlanReady(planId: string, fileName: string, dateRange: {
        start: string;
        end: string;
    }): Promise<void>;
    sendApprovalConfirmation(planId: string, issueCount: number): Promise<void>;
    sendError(context: string, error: string, requestId?: string): Promise<void>;
    private postToWebhook;
}
