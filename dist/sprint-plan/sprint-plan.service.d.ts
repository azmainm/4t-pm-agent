import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { DailySummaryRepository } from '../database/repositories/daily-summary.repository.js';
import { SprintPlanRepository } from '../database/repositories/sprint-plan.repository.js';
import { AgentRunRepository } from '../database/repositories/agent-run.repository.js';
import { ReactAgentService } from '../llm/agent/react-agent.service.js';
import { OpenaiService } from '../llm/openai.service.js';
import { DocxGeneratorService } from '../docx/docx-generator.service.js';
import { OnedriveService } from '../graph/onedrive.service.js';
import { TeamsChannelService } from '../graph/teams-channel.service.js';
import { TeamsChatService } from '../graph/teams-chat.service.js';
import { JiraService } from '../jira/jira.service.js';
import { NotificationService } from '../notification/notification.service.js';
export interface SprintPlanResult {
    runId: string;
    success: boolean;
    sprintPlanId?: string;
    error?: string;
}
export declare class SprintPlanService {
    private readonly configService;
    private readonly logger;
    private readonly summaryRepo;
    private readonly sprintPlanRepo;
    private readonly agentRunRepo;
    private readonly reactAgent;
    private readonly openaiService;
    private readonly docxGenerator;
    private readonly onedriveService;
    private readonly teamsChannelService;
    private readonly teamsChatService;
    private readonly jiraService;
    private readonly notificationService;
    constructor(configService: ConfigService, logger: PinoLogger, summaryRepo: DailySummaryRepository, sprintPlanRepo: SprintPlanRepository, agentRunRepo: AgentRunRepository, reactAgent: ReactAgentService, openaiService: OpenaiService, docxGenerator: DocxGeneratorService, onedriveService: OnedriveService, teamsChannelService: TeamsChannelService, teamsChatService: TeamsChatService, jiraService: JiraService, notificationService: NotificationService);
    generateSprintPlan(): Promise<SprintPlanResult>;
    private analyzeSummaries;
    private analyzeMessages;
    private analyzePreviousPlan;
    private generateFinalPlan;
    private getNextMonday;
    listSprintPlans(limit?: number): Promise<any[]>;
    approveAndCreateJiraTasks(sprintPlanId: string): Promise<any>;
}
