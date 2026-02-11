import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { SummarizationService } from '../llm/summarization.service.js';
import { StandupTicketsRepository } from '../database/repositories/standup-tickets.repository.js';
import { DailySummaryRepository } from '../database/repositories/daily-summary.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { NotificationService } from '../notification/notification.service.js';
export interface IngestionResult {
    runId: string;
    success: boolean;
    summaryGenerated: boolean;
    transcriptId?: string;
    error?: string;
}
export declare class IngestionService {
    private readonly configService;
    private readonly logger;
    private readonly summarizationService;
    private readonly standupTicketsRepo;
    private readonly summaryRepo;
    private readonly agentRunRepo;
    private readonly notificationService;
    constructor(configService: ConfigService, logger: PinoLogger, summarizationService: SummarizationService, standupTicketsRepo: StandupTicketsRepository, summaryRepo: DailySummaryRepository, agentRunRepo: AgentRunRepository, notificationService: NotificationService);
    runDailyIngestion(): Promise<IngestionResult>;
}
